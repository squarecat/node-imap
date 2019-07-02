import {
  addInvitedUser,
  addUser,
  create,
  getById,
  getByInviteCode,
  getByInvitedEmailOrValidDomain,
  getBySubscription,
  recordUnsubscribe,
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
  logger.info(
    `organisation-service: creating an organisation - admin ${email}`
  );
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      logger.error(
        `organisation-service: cannot create organisation, admin user does not exist`
      );
      throw new Error('cannot create organisation, admin user does not exist');
    }

    const organisation = await create({
      adminUserId: user.id,
      adminUserEmail: user.email,
      ...data
    });

    addOrganisationToStats();

    await updateUser(user.id, {
      organisationId: organisation.id,
      organisationAdmin: true,
      'milestones.completedOnboardingOrganisation': 0
    });

    // add the joined and added acount activities
    addActivityForUser(user.id, 'joinedOrganisation', {
      id: organisation.id,
      name: organisation.name,
      email: user.email
    });

    if (user.loginProvider !== 'password') {
      await addUserToOrganisation(organisation.id, {
        email: user.email
      });
      addActivityForUser(user.id, 'addedAccountToOrganisation', {
        id: organisation.id,
        name: organisation.name,
        email: user.email
      });
    }

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

    logger.debug(`organisation-service: inviting user ${email} to org ${id}`);
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

export async function removeUserFromOrganisation(organisationId, { email }) {
  try {
    logger.debug(
      `organisation-service: removing user from org ${organisationId}`
    );

    const organisation = await getById(organisationId);
    const existingMember = organisation.currentUsers.includes(email);

    if (!existingMember) {
      logger.debug(
        `organisation-service: user does not belong to this organisation ${organisationId}`
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
        total: upcomingInvoice.total,
        period_start: upcomingInvoice.period_start,
        period_end: upcomingInvoice.period_end,
        status: upcomingInvoice.status
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
    `organisation-service: can user join the organisation ${organisation.id}`
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
      `organisation-service: user cannot join - is already a member ${
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
        `organisation-service: user cannot join - email domain does not match organisation ${
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
