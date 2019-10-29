import db, { isoDate } from './db';

import logger from '../utils/logger';
import shortid from 'shortid';
import v4 from 'uuid/v4';

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
      allowAnyUserWithCompanyEmail = false,
      active = false
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
      active,
      billing: {}
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

export async function recordUnsubscribe(id) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $inc: {
          numberOfUnsubscribes: 1
        }
      }
    );
    return getById(id);
  } catch (err) {
    logger.error(
      `organisation-dao: error recording unsubscribe for organisation ${id}`
    );
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
export async function getByInvitedEmailOrValidDomain(email) {
  try {
    const domain = email.split('@')[1];
    const col = await db().collection(COL_NAME);
    return col.findOne({
      $or: [
        {
          invitedUsers: {
            $in: [email]
          }
        },
        {
          allowAnyUserWithCompanyEmail: true,
          domain
        }
      ]
    });
  } catch (err) {
    logger.error(
      `organisation-dao: error getting organisation by user invited email or valid domain`
    );
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
    logger.error(`organisation-dao: error inviting user to organisation ${id}`);
    logger.error(err);
    throw err;
  }
}

export async function bulkAddInvitedUsers(id, emails) {
  try {
    const col = await db().collection(COL_NAME);
    const activities = emails.map(email => ({
      id: v4(),
      type: 'invitedUser',
      timestamp: isoDate(),
      data: {
        email
      }
    }));
    await col.updateOne(
      { id },
      {
        $push: {
          invitedUsers: { $each: emails },
          activity: { $each: activities }
        }
      }
    );
    return getById(id);
  } catch (err) {
    logger.error(`organisation-dao: error inviting user to organisation ${id}`);
    logger.error(err);
    throw err;
  }
}

export async function removeInvitedUser(id, email) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $pull: {
          invitedUsers: email
        },
        $push: {
          activity: {
            id: v4(),
            type: 'removedInvitedUser',
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
      `organisation-dao: error removing invited user from organisation ${id}`
    );
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
          invitedUsers: email
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
          currentUsers: email
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
