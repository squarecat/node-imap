import { addActivityForUser, getUserById, removeUserAccount } from './user';
import {
  addInvitedUser,
  addUser,
  create,
  getById,
  getByInviteCode,
  getBySubscription,
  getFromInvites,
  update
} from '../dao/organisation';
import { addOrganisationToStats, addOrganisationUserToStats } from './stats';
import { bulkGetUsersByEmail, getUserByEmail, updateUser } from '../dao/user';
import { getSubscription, updateSubscription } from '../utils/stripe';

import logger from '../utils/logger';
import { sendInviteMail } from '../utils/emails/transactional';

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
  logger.info(`organisation-service: creating an organisation ${email}`);
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
      organisationAdmin: true
    });

    await addUserToOrganisation(organisation, {
      userId: user.id,
      email: user.email
    });

    return organisation;
  } catch (err) {
    throw err;
  }
}

export async function inviteUserToOrganisation(id, email) {
  try {
    const invitedUser = await getFromInvites(id, email);
    if (!invitedUser) {
      logger.debug(`organisation-service: inviting user ${email} to org ${id}`);
      const organisation = await addInvitedUser(id, email);

      sendInviteMail({
        toAddress: email,
        organisationName: organisation.name,
        inviteCode: organisation.inviteCode
      });
    }
    return true;
  } catch (err) {
    throw err;
  }
}

export async function addUserToOrganisation(organisationId, { userId, email }) {
  try {
    logger.debug(
      `organisation-service: adding user ${userId} to org ${organisationId}`
    );
    // add the account to the organisation and remove from the invites
    const organisation = await addUser(organisationId, email);
    addOrganisationUserToStats();

    const { active, billing = {}, currentUsers } = organisation;

    logger.debug(
      `organisation-service: organisation ${organisationId} now has ${
        currentUsers.length
      } users`
    );

    if (active && billing.subscriptionId) {
      const seats = currentUsers.length;
      // update the subscription to add a user
      logger.debug(
        `organisation-service: org is active & has subscription ${organisationId}. Updating seats to ${seats}`
      );
      await updateSubscription({
        subscriptionId: billing.subscriptionId,
        quantity: seats
      });
    }

    logger.debug(
      `organisation-service: removing user ${userId} connected accounts`
    );
    const user = await getUserById(userId);
    await Promise.all(
      user.accounts.map(async a => removeUserAccount(user, a.email))
    );

    addActivityForUser(user.id, 'addedToOrganisation', {
      id: organisation.id,
      name: organisation.name
    });

    return organisation;
  } catch (err) {
    throw err;
  }
}

export async function getOrganisationUserStats(id) {
  try {
    const organisation = await getOrganisationById(id);
    if (!organisation) return [];

    const users = await bulkGetUsersByEmail(organisation.currentUsers);
    if (!users) return [];

    const stats = users.map(u => {
      const joinActivity = organisation.activity.find(
        a => a.type === 'addedUser' && a.data.email === u.email
      );
      return {
        id: u.id,
        email: u.email,
        numberOfUnsubscribes: u.unsubscriptions.length,
        dateJoined: joinActivity.timestamp
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
    const { billing } = await getOrganisationById(id);
    if (!billing || !billing.subscriptionId) return null;
    const {
      canceled_at,
      current_period_start,
      current_period_end,
      ended_at,
      quantity,
      plan
    } = await getSubscription({ subscriptionId: billing.subscriptionId });
    return {
      canceled_at,
      current_period_start,
      current_period_end,
      ended_at,
      quantity,
      plan
    };
  } catch (err) {
    throw err;
  }
}
