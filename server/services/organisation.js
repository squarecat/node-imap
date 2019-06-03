import {
  addInvitedUser,
  create,
  get,
  getFromInvites
} from '../dao/organisation';
import { bulkGetUsersByEmail, getUserByEmail, updateUser } from '../dao/user';

import { addActivityForUser } from './user';
import logger from '../utils/logger';
import { sendInviteMail } from '../utils/emails/transactional';

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

    // set the user as part of the organsiation
    await updateUser(user.id, {
      organisationId: organisation.id,
      organisationAdmin: true
    });
    await addActivityForUser(user.id, 'addedToOrganisation', {
      id: organisation.id,
      name: organisation.name
    });

    return organisation;
  } catch (err) {
    throw err;
  }
}

export function getOrganisation(id) {
  return get(id);
}

export async function inviteUserToOrganisation(id, email) {
  try {
    const invitedUser = await getFromInvites(id, email);
    if (!invitedUser) {
      const organisation = await addInvitedUser(id, email);
      sendInviteMail({
        toAddress: email,
        organisationName: organisation.name
      });
    }
    return true;
  } catch (err) {
    throw err;
  }
}

export async function getOrganisationUserStats(id) {
  try {
    const organisation = await getOrganisation(id);
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
