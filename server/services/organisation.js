import { addActivityForUser, getUserById, removeUserAccount } from './user';
import {
  addInvitedUser,
  addUser,
  create,
  getById,
  getByInviteCode,
  getFromInvites
} from '../dao/organisation';
import { addOrganisationToStats, addOrganisationUserToStats } from './stats';
import { bulkGetUsersByEmail, getUserByEmail, updateUser } from '../dao/user';

import logger from '../utils/logger';
import { sendInviteMail } from '../utils/emails/transactional';

export function getOrganisationById(id) {
  return getById(id);
}

export function getOrganisationByInviteCode(code) {
  return getByInviteCode(code);
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

    logger.debug(
      `organisation-service: removing user ${userId} connected accounts`
    );
    // TODO remove connected accounts
    const user = await getUserById(userId);
    await Promise.all(
      user.accounts.map(async a => removeUserAccount(user, a.email))
    );

    addActivityForUser(userId, 'addedToOrganisation', {
      id: organisationId,
      name: organisation.name
    });
    addOrganisationUserToStats();
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
