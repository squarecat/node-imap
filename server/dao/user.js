import db, { isoDate } from './db';
import { decrypt, encrypt } from './encryption';

import logger from '../utils/logger';
import shortid from 'shortid';

const COL_NAME = 'users';
const encryptedUnsubCols = [
  'unsubscribeLink',
  'unsubscribeMailTo',
  'to',
  'from'
];

export async function createUser(data) {
  const { keys } = data;
  try {
    const col = await db().collection(COL_NAME);
    await col.insertOne({
      ...data,
      createdAt: isoDate(),
      lastUpdatedAt: isoDate(),
      referralCode: shortid.generate(),
      referrals: [],
      keys: {
        refreshToken: encrypt(keys.refreshToken),
        accessToken: encrypt(keys.accessToken),
        expires: keys.expires,
        expiresIn: keys.expiresIn
      },
      unsubscriptions: [],
      scans: [],
      paidScans: [],
      preferences: {
        hideUnsubscribedMails: false,
        marketingConsent: true
      }
    });
    const user = await getUser(data.id);
    return user;
  } catch (err) {
    logger.error('users-dao: error inserting user');
    logger.error(JSON.stringify(data, null, 2));
    logger.error(err);
    throw err;
  }
}

export async function getUser(id) {
  try {
    const col = await db().collection(COL_NAME);
    const user = await col.findOne({ id }, { fields: { _id: 0 } });
    if (!user) return null;
    const decryptedUser = {
      ...user,
      keys: {
        ...user.keys,
        refreshToken: decrypt(user.keys.refreshToken),
        accessToken: decrypt(user.keys.accessToken)
      },
      unsubscriptions: user.unsubscriptions.map(unsub => {
        return Object.keys(unsub).reduce((out, k) => {
          if (encryptedUnsubCols.includes(k)) {
            return {
              ...out,
              [k]: decrypt(unsub[k])
            };
          }
          return {
            ...out,
            [k]: unsub[k]
          };
        }, {});
      })
    };
    return decryptedUser;
  } catch (err) {
    logger.error(`users-dao: error fetching user ${id}`);
    logger.error(err);
    throw err;
  }
}

export async function updateUser(id, userData) {
  const { keys } = userData;
  let updateObj = {
    ...userData,
    lastUpdatedAt: isoDate()
  };
  if (keys) {
    updateObj = {
      ...updateObj,
      keys: {
        ...keys,
        refreshToken: encrypt(keys.refreshToken),
        accessToken: encrypt(keys.accessToken)
      }
    };
  }
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $set: updateObj
      }
    );
    const user = await getUser(id);
    return user;
  } catch (err) {
    logger.error(`users-dao: error updating user ${id}`);
    logger.error(err);
    throw err;
  }
}

export async function addUnsubscription(id, mailData) {
  const data = Object.keys(mailData).reduce((out, k) => {
    if (encryptedUnsubCols.includes(k)) {
      return {
        ...out,
        [k]: encrypt(mailData[k])
      };
    }
    return {
      ...out,
      [k]: mailData[k]
    };
  }, {});
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $push: {
          unsubscriptions: { ...data, unsubscribedAt: isoDate() }
        }
      }
    );
  } catch (err) {
    logger.error(`users-dao: error updating user ${id} unsubscriptions`);
    logger.error(err);
    throw err;
  }
}

export async function resolveUnsubscription(id, mailId) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id, 'unsubscriptions.id': mailId },
      { $set: { 'unsubscriptions.$.resolved': true } }
    );
  } catch (err) {
    logger.error(`users-dao: error resolving user ${id} unsubscriptions`);
    logger.error(err);
    throw err;
  }
}

export async function addScan(id, scanData) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $push: {
          scans: { ...scanData, scannedAt: isoDate(scanData.scannedAt) }
        }
      }
    );
  } catch (err) {
    logger.error(`users-dao: error updating user ${id} scans`);
    logger.error(err);
    throw err;
  }
}

export async function updatePaidScan(id, scanType) {
  try {
    const col = await db().collection(COL_NAME);
    const { paidScans = [] } = await getUser(id);
    const newPaidScans = paidScans.reduce(
      (out, p) => {
        if (!out.done && p.scanType === scanType && !p.performed) {
          return {
            done: true,
            scans: [...out.scans, { ...p, performed: true }]
          };
        }
        return { ...out, scans: [...out.scans, p] };
      },
      { done: false, scans: [] }
    );
    await col.updateOne({ id }, { $set: { paidScans: newPaidScans.scans } });
  } catch (err) {
    logger.error(
      `users-dao: error updating user ${id} paid scans with scan type ${scanType}`
    );
    logger.error(err);
    throw err;
  }
}

export async function addPaidScan(id, scanType) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $push: {
          paidScans: { scanType, paidAt: isoDate(), performed: false }
        }
      }
    );
  } catch (err) {
    logger.error(
      `users-dao: error adding user ${id} paid scans with scan type ${scanType}`
    );
    logger.error(err);
    throw err;
  }
}

export async function updateIgnoreList(id, { action, value }) {
  try {
    const col = await db().collection(COL_NAME);
    let update = {
      $set: {
        lastUpdatedAt: isoDate()
      }
    };
    if (action === 'add') {
      update = {
        ...update,
        $push: {
          ignoredSenderList: value
        }
      };
    } else if (action === 'remove') {
      update = {
        ...update,
        $pull: {
          ignoredSenderList: { $in: [value] }
        }
      };
    } else {
      throw new Error('Operation not supported');
    }
    col.updateOne({ id }, update);
    const user = await getUser(id);
    return user;
  } catch (err) {
    logger.error(
      `users-dao: error performing ${action} to user ${id} ignore list`
    );
    logger.error(err);
    throw err;
  }
}

export async function addScanReminder(id, { timeframe, remindAt }) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $set: {
          reminder: {
            timeframe,
            remindAt,
            sent: false
          }
        }
      }
    );
    const user = await getUser(id);
    return user;
  } catch (err) {
    logger.error(
      `users-dao: error adding scan reminder for timeframe ${timeframe} to user ${id}`
    );
    logger.error(err);
    throw err;
  }
}

export async function removeScanReminder(id) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $set: {
          reminder: null
        }
      }
    );
    const user = await getUser(id);
    return user;
  } catch (err) {
    logger.error(`users-dao: error removing scan reminder for user ${id}`);
    logger.error(err);
    throw err;
  }
}

export async function addReferral(id, { userId, scanType, price }) {
  try {
    const col = await db().collection(COL_NAME);
    if (id === userId) {
      return logger.warn(
        `users-dao: user ${id} tried to redeem own referral code`
      );
    }
    return col.updateOne(
      { id },
      {
        $push: {
          referrals: {
            userId,
            scanType,
            price
          }
        }
      }
    );
  } catch (err) {
    logger.error(`users-dao: failed to add referral to ${id}`);
    logger.error(err);
    throw err;
  }
}

export async function findUsersNeedReminders() {
  try {
    const col = await db().collection(COL_NAME);
    const query = {
      'reminder.remindAt': { $lt: new Date() },
      'reminder.sent': { $ne: true }
    };
    const users = await col.find(query);
    return users.toArray();
  } catch (err) {
    logger.error(`users-dao: error finding users needing reminders`);
    logger.error(err);
    throw err;
  }
}

export async function updateReferral(id, { userId, scanType, price }) {
  try {
    const col = await db().collection(COL_NAME);
    if (id === userId) {
      return logger.warn(
        `users-dao: user ${id} tried to redeem own referral code`
      );
    }
    await col.updateOne(
      { id, 'referrals.userId': userId },
      {
        $set: {
          'referrals.$.scanType': scanType,
          'referrals.$.price': price
        }
      }
    );
    return getUser(id);
  } catch (err) {
    logger.error(`users-dao: failed to update referral to ${id}`);
    logger.error(err);
    throw err;
  }
}

export async function updateUsersReminded(ids) {
  try {
    const col = await db().collection(COL_NAME);
    const users = await col.update(
      { _id: { $in: ids } },
      {
        $set: {
          'reminder.sent': true
        }
      },
      { multi: true }
    );
    return users;
  } catch (err) {
    logger.error(`users-dao: error updating reminded users`);
    logger.error(err);
    throw err;
  }
}

export async function incrementUserReferralBalance(id, amount) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $inc: { referralBalance: amount }
      }
    );
    const user = await getUser(id);
    return user;
  } catch (err) {
    logger.error(`users-dao: error updating reminded users`);
    logger.error(err);
    throw err;
  }
}

export async function getUserByReferralCode(referralCode) {
  try {
    const col = await db().collection(COL_NAME);
    return col.findOne({ referralCode });
  } catch (err) {
    logger.error(
      `users-dao: failed to get user by referral code ${referralCode}`
    );
    logger.error(err);
    throw err;
  }
}

export async function getUnsubscriptionsLeaderboard() {
  try {
    const col = await db().collection(COL_NAME);
    const results = await col
      .aggregate([
        { $unwind: '$unsubscriptions' },
        { $group: { _id: '$_id', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, count: 1 } }
      ])
      .toArray();
    return results.map(r => r.count.toFixed());
  } catch (err) {
    logger.error('user-dao: failed to get leaderboard');
    logger.error(err);
    throw err;
  }
}

export async function getProviderStats() {
  try {
    const col = await db().collection(COL_NAME);
    const googleUsers = await col.countDocuments({ provider: 'google' });
    const outlookUsers = await col.countDocuments({ provider: 'outlook' });
    return {
      googleUsers,
      outlookUsers
    };
  } catch (err) {
    logger.error('user-dao: failed to get provider stats');
    logger.error(err);
    throw err;
  }
}

export async function removeUser(id) {
  try {
    const col = await db().collection(COL_NAME);
    await col.deleteOne({ id });
  } catch (err) {
    logger.error('user-dao: failed to remove user');
    logger.error(err);
    throw err;
  }
}
