import {
  addInvitedUser,
  addUser,
  create,
  getById,
  getByInviteCode,
  getByInvitedEmailOrValidDomain,
  getBySubscription,
  recordUnsubscribe,
  removeInvitedUser,
  removeUser,
  update
} from '../dao/organisation';
import {
  addOrganisationToStats,
  addOrganisationUnsubscribeToStats,
  addOrganisationUserToStats,
  removeOrganisationUserToStats
} from './stats';
import {
  bulkGetUsersByOrganisationId,
  getUserByEmail,
  updateUser
} from '../dao/user';
import {
  getSubscription,
  getUpcomingInvoice,
  updateSubscription
} from '../utils/stripe';

import { addActivityForUser } from './user';
import { listPaymentsForOrganisation } from './payments';
import logger from '../utils/logger';
import { sendOrganisationInviteMail } from '../utils/emails/transactional';

export function getOrganisationById(id) {
  return getById(id);
}

export function getOrganisationByInviteCode(code) {
  return getByInviteCode(code);
}

export function getOrganisationBySubscription(subscriptionId) {
  return getBySubscription(subscriptionId);
}

export async function createOrganisation(email, data) {
  logger.info(`organisation-service: creating an organisation...`);
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      logger.error(
        `organisation-service: cannot create organisation, admin user does not exist`
      );
      throw new Error(`cannot create organisation, admin user does not exist`);
    }

    const organisation = await create({
      adminUserId: user.id,
      adminUserEmail: user.email,
      ...data
    });

    const { id, name } = organisation;

    addOrganisationToStats();

    logger.debug(`organisation-service: updating admin user record...`);
    await updateUser(user.id, {
      organisationId: id,
      organisationAdmin: true,
      'milestones.completedOnboardingOrganisation': 0
    });

    // add the joined and added acount activities
    addActivityForUser(user.id, 'joinedOrganisation', {
      id,
      name,
      email: user.email
    });

    if (user.loginProvider !== 'password') {
      logger.debug(
        `organisation-service: login provider is not password, adding account to organisation ${id}`
      );
      await addUserToOrganisation(id, {
        email: user.email
      });
      addActivityForUser(user.id, 'addedAccountToOrganisation', {
        id,
        name,
        email: user.email
      });
    } else {
      logger.debug(
        `organisation-service: login provider is password, inviting account to organisation ${id}`
      );
      await addInvitedUser(id, email);
    }

    logger.debug(`organisation-service: created organisation ${id}!`);
    return organisation;
  } catch (err) {
    throw err;
  }
}

export async function inviteUserToOrganisation(id, email) {
  try {
    const organisation = await getById(id);
    const isAdmin = organisation.adminUserEmail === email;
    const invited = organisation.invitedUsers.includes(email);

    logger.debug(`organisation-service: inviting user to org ${id}`);
    if (!isAdmin && !invited) {
      // only add the user to the invite list if not already there and not an admin
      await addInvitedUser(id, email);
    }

    // always send the invite email in case someone lost it etc
    sendOrganisationInviteMail({
      toAddress: email,
      organisationName: organisation.name,
      inviteCode: organisation.inviteCode
    });
    return true;
  } catch (err) {
    throw err;
  }
}

export async function revokeOrganisationInvite(id, email) {
  logger.debug(`organisation-service: revoking invite for organisation ${id}`);
  return removeInvitedUser(id, email);
}

export async function addUserToOrganisation(organisationId, { email }) {
  try {
    logger.debug(`organisation-service: adding user to org ${organisationId}`);

    const organisation = await getById(organisationId);
    const existingMember = organisation.currentUsers.includes(email);

    if (existingMember) {
      logger.debug(
        `organisation-service: user already belongs to this organisation ${organisationId}`
      );
      return organisation;
    }

    // add the user to the organisation
    const updatedOrganisation = await addUser(organisationId, email);
    addOrganisationUserToStats();

    await updateOrganisationSubscription(updatedOrganisation);

    return updatedOrganisation;
  } catch (err) {
    throw err;
  }
}

// this removes one user account from an organisation
// check if the user is in the organisation
// remove the account from current users
// update the subcription
export async function removeUserAccountFromOrganisation(
  organisationId,
  { email }
) {
  try {
    logger.debug(
      `organisation-service: removing user account from org ${organisationId}`
    );

    const organisation = await getById(organisationId);
    const existingMember = organisation.currentUsers.includes(email);

    // we need to check this to avoid unnecessary calls to stripe to update the subscription
    // if the number of seats do not change
    if (!existingMember) {
      logger.debug(
        `organisation-service: account does not belong to this organisation ${organisationId}`
      );
      return organisation;
    }

    // remove the user from the organisation
    const updatedOrganisation = await removeUser(organisationId, email);
    removeOrganisationUserToStats();

    await updateOrganisationSubscription(updatedOrganisation);

    return updatedOrganisation;
  } catch (err) {
    throw err;
  }
}

// this removes an entire user and associated accounts from an org
// remove the accounts from the org current users
// update the subscription to reflet new seats amount
// update the user to remove the organisationId
export async function removeUserFromOrganisation(organisationId, { email }) {
  try {
    logger.debug(
      `organisation-service: removing user & all accounts from org ${organisationId}`
    );

    const organisation = await getById(organisationId);

    if (email === organisation.adminUserEmail) {
      logger.debug(
        `organisation-service: cannot remove user from organisation - user is an organisation admin`
      );
      throw new Error(
        'cannot remove user from organisation - user is an organisation admin'
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      logger.debug(`organisation-service: user not found`);
      throw new Error('cannot remove user from organisation - user not found');
    }

    await Promise.all(
      user.accounts.map(async a => {
        const existingMember = organisation.currentUsers.includes(email);
        if (!existingMember) {
          return true;
        }
        await removeUser(organisationId, a.email);
        removeOrganisationUserToStats();
      })
    );

    await updateUser(user.id, {
      organisationId: null
    });
    addActivityForUser(user.id, 'leftOrganisation', {
      id: organisationId,
      name,
      email: user.email
    });

    const updatedOrganisation = await getById(organisationId);
    await updateOrganisationSubscription(updatedOrganisation);

    return updatedOrganisation;
  } catch (err) {
    throw err;
  }
}

export async function updateOrganisationSubscription({
  id,
  billing = {},
  currentUsers
}) {
  try {
    if (!billing.subscriptionId) {
      logger.debug(
        `organisation-service: organisation ${id} has no active subscription`
      );
      return false;
    }

    logger.debug(
      `organisation-service: updating organisation ${id} subscription to ${
        currentUsers.length
      } seats`
    );
    const seats = currentUsers.length;
    await updateSubscription({
      subscriptionId: billing.subscriptionId,
      quantity: seats
    });
  } catch (err) {
    throw err;
  }
}

export async function getOrganisationUserStats(id) {
  try {
    const organisation = await getById(id);
    if (!organisation) return [];

    const users = await bulkGetUsersByOrganisationId(id);
    if (!users) return [];

    const stats = users.map(user => {
      const joinedOrgActivity = user.activity.find(
        ({ type }) => type === 'joinedOrganisation'
      );
      return {
        email: user.email,
        joinedAt: joinedOrgActivity.timestamp,
        numberOfUnsubscribes: user.unsubscriptions.length,
        numberOfAccounts: user.accounts.length
      };
    });
    return stats;
  } catch (err) {
    throw err;
  }
}

export function updateOrganisation(id, data) {
  return update(id, data);
}

export async function getOrganisationSubscription(id) {
  try {
    const { customerId, billing = {} } = await getById(id);
    const { subscriptionId } = billing;

    if (!subscriptionId) return null;

    const {
      canceled_at,
      current_period_start,
      current_period_end,
      ended_at,
      quantity,
      plan
    } = await getSubscription({ subscriptionId });

    const upcomingInvoice = await getUpcomingInvoice({
      customerId,
      subscriptionId
    });

    return {
      canceled_at,
      current_period_start,
      current_period_end,
      ended_at,
      quantity,
      plan,
      upcomingInvoice: {
        total: upcomingInvoice.total > 0 ? upcomingInvoice.total : 0
      }
    };
  } catch (err) {
    throw err;
  }
}

export function getOrganisationByInvitedEmailOrValidDomain(email) {
  return getByInvitedEmailOrValidDomain(email);
}

export function canUserJoinOrganisation({ email, organisation }) {
  logger.debug(
    `organisation-service: checking if user can user join the organisation ${
      organisation.id
    }`
  );
  const {
    allowAnyUserWithCompanyEmail,
    invitedUsers,
    currentUsers,
    domain
  } = organisation;

  // user already belongs to that organisation (no further steps required)
  const existingMember = currentUsers.includes(email);
  if (existingMember) {
    logger.info(
      `organisation-service: user cannot join - is already a member of organisation ${
        organisation.id
      }`
    );
    return {
      allowed: false,
      reason: 'existing-member'
    };
  }

  // user is invited to the organisation
  // invited users are always allowed to join`
  const invited = invitedUsers.includes(email);
  if (invited) {
    logger.info(
      `organisation-service: user can join - is invited ${organisation.id}`
    );
    return {
      allowed: true
    };
  }

  // if not invited and allowed company domains
  if (allowAnyUserWithCompanyEmail) {
    const userEmailDomain = email.split('@')[1];
    if (userEmailDomain === domain) {
      logger.info(
        `organisation-service: user can join - email has matching domain ${domain} with allow users with company email ${
          organisation.id
        }`
      );
      return {
        allowed: true
      };
    } else {
      logger.info(
        `organisation-service: user cannot join - email domain ${userEmailDomain} does not match organisation ${
          organisation.id
        }`
      );
      return {
        allowed: false,
        reason: 'invalid-domain'
      };
    }
  }

  // user is not invited and their domain does not match the company
  logger.info(
    `organisation-service: user cannot join - not invited ${organisation.id}`
  );
  return {
    allowed: false,
    reason: 'not-invited'
  };
}

export function recordUnsubscribeForOrganisation(id) {
  addOrganisationUnsubscribeToStats();
  return recordUnsubscribe(id);
}

export async function getOrganisationPayments(id) {
  return listPaymentsForOrganisation(id);
}
