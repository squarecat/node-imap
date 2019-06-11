import db, { isoDate } from './db';

import logger from '../utils/logger';
import shortid from 'shortid';
import { v4 } from 'node-uuid';

const COL_NAME = 'organisations';

// const organisation = {
//   name: 'Squarecat', // name of company
//   adminUserId: '123456789', // id of user
//   adminUserEmail: 'test@test.com', // email of user
//   allowAnyUserWithCompanyEmail: true,
//   currentUsers: [
//      // array of users in the organisation
//     'test@test.com',
//     'test2@test.com',
//     'test3@test.com'
//   ],
//   invitedUsers: [], // array of invites that don't count towards the seats count
//   active: false, // if the org is active. if false users cannot unsub
//   // same as users billing added at onboarding
//   billing: {
//     card: {
//       last4: '4242',
//       exp_month: 3,
//       exp_year: 2020
//     }
//   },
//   // added at onboarding
//   company: {
//     vatNumber: 'xxx',
//     name: 'Squarecat OU',
//     address: 'Sepapaja 6, Estonia'
//   },
//   customerId: 'xxx', // stripe customer id
//   paymentMethodId: 'xxx', // stripe payment method id
//   subscriptiondId: 'xxx', // stripe subscription id
//   activity: [] // things that happened
// };

export async function create(data) {
  try {
    const col = await db().collection(COL_NAME);

    const id = v4();
    const {
      name,
      adminUserId,
      adminUserEmail,
      domain,
      allowAnyUserWithCompanyEmail = false
    } = data;

    await col.insertOne({
      id,
      createdAt: isoDate(),
      lastUpdatedAt: isoDate(),
      inviteCode: shortid.generate(),
      name,
      adminUserId,
      adminUserEmail,
      domain,
      allowAnyUserWithCompanyEmail,
      invitedUsers: [],
      currentUsers: [],
      activity: [],
      active: false
    });
    return getById(id);
  } catch (err) {
    logger.error('organisation-dao: error inserting organisation');
    logger.error(err);
    throw err;
  }
}

export async function update(id, data) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $set: {
          ...data,
          lastUpdatedAt: isoDate()
        }
      }
    );
    return getById(id);
  } catch (err) {
    logger.error(`organisation-dao: error updating organisation ${id}`);
    logger.error(err);
    throw err;
  }
}

export async function getById(id) {
  try {
    const col = await db().collection(COL_NAME);
    return col.findOne({ id });
  } catch (err) {
    logger.error(`organisation-dao: error getting organisation by id ${id}`);
    logger.error(err);
    throw err;
  }
}

export async function getByInviteCode(inviteCode) {
  try {
    const col = await db().collection(COL_NAME);
    return col.findOne({ inviteCode });
  } catch (err) {
    logger.error(
      `organisation-dao: error getting organisation by invite code ${inviteCode}`
    );
    logger.error(err);
    throw err;
  }
}
export async function getBySubscription(subscriptiondId) {
  try {
    const col = await db().collection(COL_NAME);
    return col.findOne({ 'billing.subscriptionId': subscriptiondId });
  } catch (err) {
    logger.error(
      `organisation-dao: error getting organisation by subscription ${subscriptiondId}`
    );
    logger.error(err);
    throw err;
  }
}

export async function getFromInvites(id, email) {
  try {
    const col = await db().collection(COL_NAME);
    return col.findOne({
      id,
      invitedUsers: {
        $in: [email]
      }
    });
  } catch (err) {
    logger.error(`organisation-dao: error getting organisation ${id}`);
    logger.error(err);
    throw err;
  }
}

export async function addInvitedUser(id, email) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $push: {
          invitedUsers: email,
          activity: {
            id: v4(),
            type: 'invitedUser',
            timestamp: isoDate(),
            data: {
              email
            }
          }
        }
      }
    );
    return getById(id);
  } catch (err) {
    logger.error(`organisation-dao: error adding user to organisation ${id}`);
    logger.error(err);
    throw err;
  }
}

export async function addUser(id, email) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $pull: {
          invitedUsers: { $in: [email] }
        },
        $push: {
          currentUsers: email,
          activity: {
            id: v4(),
            type: 'addedUser',
            timestamp: isoDate(),
            data: {
              email
            }
          }
        }
      }
    );
    return getById(id);
  } catch (err) {
    logger.error(`organisation-dao: error adding user to organisation ${id}`);
    logger.error(err);
    throw err;
  }
}

export async function removeUser(id, email) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $pull: {
          currentUsers: { $in: [email] }
        },
        $push: {
          activity: {
            id: v4(),
            type: 'removedUser',
            timestamp: isoDate(),
            data: {
              email
            }
          }
        }
      }
    );
    return getById(id);
  } catch (err) {
    logger.error(
      `organisation-dao: error removing user from organisation ${id}`
    );
    logger.error(err);
    throw err;
  }
}
