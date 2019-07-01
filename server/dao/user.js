import {
  checkPassword,
  decrypt,
  decryptUnsubscriptions,
  encrypt,
  hashEmail,
  hashPassword
} from './encryption';
import db, { isoDate } from './db';

import logger from '../utils/logger';
import shortid from 'shortid';
import { v4 } from 'node-uuid';

const encryptedUnsubCols = [
  'unsubscribeLink',
  'unsubscribeMailTo',
  'to',
  'from'
];

const defaultProjection = {
  _id: 0,
  id: 1,
  email: 1,
  token: 1,
  beta: 1,
  unsubscriptions: 1,
  profileImg: 1,
  ignoredSenderList: 1,
  referredBy: 1,
  referralCode: 1,
  reminder: 1,
  preferences: 1,
  loginProvider: 1,
  lastUpdatedAt: 1,
  accounts: 1,
  billing: 1,
  milestones: 1
};

const COL_NAME = 'users';

function getUserDefaults({ email }) {
  return {
    createdAt: isoDate(),
    lastUpdatedAt: isoDate(),
    hashedEmails: [hashEmail(email)],
    referralCode: shortid.generate(),
    referrals: [],
    unsubscriptions: [],
    activity: [],
    preferences: {
      marketingConsent: true
    },
    milestones: {},
    billing: {
      credits: 0
    },
    _version: '2.0'
  };
}

export async function createUserFromPassword(data) {
  try {
    const col = await db().collection(COL_NAME);
    const id = v4();
    await col.insertOne({
      ...data,
      id,
      ...getUserDefaults({ email: data.email }),
      accounts: [],
      password: hashPassword(data.password),
      verificationCode: shortid.generate()
    });
    return getUser(id);
  } catch (err) {
    logger.error('users-dao: error inserting user with password');
    logger.error(err);
    throw err;
  }
}

export async function createUser(data, account) {
  try {
    const col = await db().collection(COL_NAME);
    await col.insertOne({
      ...data,
      ...getUserDefaults({ email: data.email }),
      accounts: [
        {
          ...account,
          keys: encryptKeys(account.keys),
          addedAt: isoDate()
        }
      ]
    });
    const user = await getUser(data.id);
    return user;
  } catch (err) {
    logger.error('users-dao: error inserting user');
    logger.error(err);
    throw err;
  }
}

export async function getUser(id, projection = {}, options = {}) {
  try {
    const col = await db().collection(COL_NAME);
    const user = await col.findOne(
      { id },
      { ...defaultProjection, ...projection }
    );
    if (!user) return null;
    let decryptedUser = decryptUser(user, options);
    return decryptedUser;
  } catch (err) {
    logger.error(`users-dao: error fetching user ${id}`);
    logger.error(err);
    throw err;
  }
}

export async function getUserByEmail(email, projection = {}) {
  try {
    const col = await db().collection(COL_NAME);
    const user = await col.findOne({ email }, { _id: 0, ...projection });
    if (!user) return null;
    return decryptUser(user);
  } catch (err) {
    logger.error(`users-dao: failed to get user by email`);
    logger.error(err);
    throw err;
  }
}

export async function bulkGetUsersByOrganisationId(organisationId) {
  try {
    const col = await db().collection(COL_NAME);
    return col
      .find({
        organisationId
      })
      .toArray();
  } catch (err) {
    logger.error(`users-dao: failed to get user by organisationId`);
    logger.error(err);
    throw err;
  }
}

export async function updateUser(id, userData) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $set: {
          ...userData,
          lastUpdatedAt: isoDate()
        }
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

export async function updateUserWithAccount(
  { userId, accountEmail },
  accountData = {},
  keys
) {
  try {
    const col = await db().collection(COL_NAME);
    let updatedKeys;

    logger.debug(`user-dao: updating user with account ${userId}`);

    if (keys.refreshToken) {
      logger.debug(
        `user-dao: keys has a refresh token, setting all keys ${userId}`
      );
      updatedKeys = {
        'accounts.$.keys': encryptKeys(keys)
      };
    } else {
      logger.debug(
        `user-dao: keys does not have refresh token, setting access token only ${userId}`
      );
      updatedKeys = {
        'accounts.$.keys.accessToken': encrypt(keys.accessToken),
        'accounts.$.keys.expiresIn': keys.expiresIn,
        'accounts.$.keys.expires': keys.expires
      };
    }
    let query = {
      id: userId,
      'accounts.email': accountEmail
    };
    logger.debug(`user-dao: updating user account ${accountEmail}`);
    await col.updateOne(query, {
      $set: {
        ...accountData,
        ...updatedKeys,
        lastUpdatedAt: isoDate()
      }
    });
    const user = await getUser(userId);
    return user;
  } catch (err) {
    logger.error(`users-dao: error updating user with account ${userId}`);
    logger.error(err);
    throw err;
  }
}

export async function addAccount(id, data) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $push: {
          hashedEmails: hashEmail(data.email),
          accounts: {
            ...data,
            keys: encryptKeys(data.keys),
            addedAt: isoDate()
          }
        }
      }
    );
    const user = await getUser(id);
    return user;
  } catch (err) {
    logger.error(`user-dao: failed to add user account for user ${id}`);
  }
}

export async function addUnsubscription(id, mailData) {
  let data = Object.keys(mailData).reduce((out, k) => {
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
  if (data.unsubscribeStrategy === 'mailto') {
    data = {
      ...data,
      status: 'pending',
      message: ''
    };
  }
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $push: {
          unsubscriptions: {
            ...data,
            unsubscribedAt: isoDate()
          }
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

// export async function addScan(id, scanData) {
//   try {
//     const col = await db().collection(COL_NAME);
//     await col.updateOne(
//       { id },
//       {
//         $push: {
//           scans: { ...scanData, scannedAt: isoDate(scanData.scannedAt) }
//         }
//       }
//     );
//   } catch (err) {
//     logger.error(`users-dao: error updating user ${id} scans`);
//     logger.error(err);
//     throw err;
//   }
// }

export async function addPackage(id, productId, credits) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $set: {
          'billing.previousPackageId': productId
        },
        $inc: {
          'billing.credits': credits
        }
      }
    );
    const user = await getUser(id);
    return user;
  } catch (err) {
    logger.error(
      `users-dao: error adding user ${id} package ${productId} credits ${credits}`
    );
    logger.error(err);
    throw err;
  }
}

export async function incrementCredits(id, credits) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $set: {
          lastUpdatedAt: isoDate()
        },
        $inc: {
          'billing.credits': credits
        }
      }
    );
    const user = await getUser(id);
    return user;
  } catch (err) {
    logger.error(
      `users-dao: error incrementing user ${id} credits by ${credits}`
    );
    logger.error(err);
    throw err;
  }
}

export async function incrementCreditsUsed(id, credits = 1) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $set: {
          lastUpdatedAt: isoDate()
        },
        $inc: {
          'billing.creditsUsed': credits
        }
      }
    );
    const user = await getUser(id);
    return user;
  } catch (err) {
    logger.error(
      `users-dao: error incrementing user ${id} credits by ${credits}`
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

export async function addReminder(id, { timeframe, remindAt }) {
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

export async function removeReminder(id) {
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

export async function addReferral(id, { id: userId, email, reward }) {
  try {
    const col = await db().collection(COL_NAME);
    if (id === userId) {
      return logger.warn(
        `users-dao: user ${id} tried to redeem own referral code`
      );
    }
    await col.updateOne(
      { id },
      {
        $push: {
          referrals: {
            userId,
            email,
            reward
          }
        }
      }
    );
    return getUser(id);
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

export async function updateUnsubStatus(
  id,
  { mailId, status, message = '', ...data } = {}
) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id, 'unsubscriptions.id': mailId },
      {
        $set: {
          'unsubscriptions.$.status': status,
          'unsubscriptions.$.message': message,
          'unsubscriptions.$.data': data
        }
      }
    );
  } catch (err) {
    logger.error('user-dao: failed to update unsub status');
    logger.error(err);
    throw err;
  }
}

export async function removeAccount(userId, { accountId, email }) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id: userId },
      {
        $set: {
          lastUpdatedAt: isoDate()
        },
        $pull: {
          accounts: { id: accountId },
          hashedEmails: hashEmail(email)
        }
      }
    );
    const user = await getUser(userId);
    return user;
  } catch (err) {
    throw new Error(`failed to disconnect user account for user`, {
      userId,
      accountId,
      cause: err
    });
  }
}

export async function authenticate({ email, password }) {
  try {
    const user = await getUserByEmail(email, {
      password: 1
    });
    if (!user) return null;
    const { password: userPassword } = user;
    const { salt, hash } = userPassword;
    if (checkPassword(password, salt, hash)) {
      return user;
    }
    return null;
  } catch (err) {
    logger.error('user-dao: failed to update unsub status');
    logger.error(err);
    throw err;
  }
}

export async function getTotpSecret(userId) {
  try {
    const user = await getUser(userId, {
      password: 1
    });
    if (!user) return null;
    const { password: userPassword } = user;
    const { totpSecret, unverified } = userPassword;
    return { secret: totpSecret, unverified };
  } catch (err) {
    logger.error('user-dao: failed to get totp secret');
    logger.error(err);
    throw err;
  }
}

export async function addTotpSecret(userId, { secret, unverified = true }) {
  try {
    return updateUser(userId, {
      'password.totpSecret': secret,
      'password.unverified': unverified
    });
  } catch (err) {
    logger.error('user-dao: failed to set totp secret');
    logger.error(err);
    throw err;
  }
}

export async function verifyTotpSecret(userId) {
  try {
    const col = await db().collection(COL_NAME);
    return col.updateOne(
      { id: userId },
      {
        $unset: {
          'password.unverified': 1
        }
      }
    );
  } catch (err) {
    logger.error('user-dao: failed to verify totp secret');
    logger.error(err);
    throw err;
  }
}

export async function removeTotpSecret(userId) {
  try {
    const col = await db().collection(COL_NAME);
    return col.updateOne(
      { id: userId },
      {
        $unset: {
          'password.unverified': 1,
          'password.totpSecret': 1
        }
      }
    );
  } catch (err) {
    logger.error('user-dao: failed to remove totp secret');
    logger.error(err);
    throw err;
  }
}

export async function getLoginProvider(hashedEmail) {
  try {
    const col = await db().collection(COL_NAME);
    const users = await col
      .find(
        { hashedEmails: hashedEmail },
        {
          loginProvider: 1,
          email: 1,
          accounts: 1
        }
      )
      .toArray();
    if (!users.length) return null;
    const userWithLoginEmail = users.find(
      u => hashEmail(u.email) === hashedEmail
    );
    return userWithLoginEmail ? userWithLoginEmail.loginProvider : null;
  } catch (err) {
    logger.error('user-dao: failed to get user login provider');
    logger.error(err);
    throw err;
  }
}

export async function updatePassword(id, newPassword) {
  try {
    const col = await db().collection(COL_NAME);
    const password = hashPassword(newPassword);
    await col.updateOne(
      { id },
      {
        $set: {
          'password.salt': password.salt,
          'password.hash': password.hash,
          lastUpdatedAt: isoDate()
        },
        $unset: {
          resetCode: 1,
          resetCodeExpires: 1
        }
      }
    );
    const user = await getUser(id);
    return user;
  } catch (err) {
    logger.error('user-dao: failed to update password');
    logger.error(err);
    throw err;
  }
}

export async function removeBillingCard(userId) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id: userId },
      {
        $set: {
          lastUpdatedAt: isoDate()
        },
        $unset: {
          'billing.card': 1
        }
      }
    );
    const user = await getUser(userId);
    return user;
  } catch (err) {
    logger.error(`user-dao: failed to remove billing card for user ${userId}`);
    logger.error(err);
    throw err;
  }
}

export async function setMilestoneCompleted(userId, milestoneName) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id: userId },
      {
        $set: {
          [`milestones.${milestoneName}`]: 1,
          lastUpdatedAt: isoDate()
        }
      }
    );
    const user = await getUser(userId);
    return user;
  } catch (err) {
    logger.error(`user-dao: failed to remove billing card for user ${userId}`);
    logger.error(err);
    throw err;
  }
}

export async function addActivity(id, activityData) {
  try {
    const col = await db().collection(COL_NAME);
    const activityId = v4();
    const activity = {
      ...activityData,
      id: activityId,
      timestamp: isoDate()
    };
    await col.updateOne(
      { id },
      {
        $push: {
          activity
        },
        $set: {
          lastUpdatedAt: isoDate()
        }
      }
    );
    return activity;
  } catch (err) {
    logger.error(`user-dao: failed to add activity for user ${id}`);
    logger.error(err);
    throw err;
  }
}

export async function setNotificationsRead(id, activityIds = []) {
  try {
    const col = await db().collection(COL_NAME);
    let query = {
      id
    };
    // specify which ones to set
    if (activityIds.length) {
      query = {
        ...query,
        activity: { $in: activityIds }
      };
    }
    await col.updateOne(
      query,
      {
        $set: {
          'activity.$[elem].notificationSeen': true
        }
      },
      {
        multi: true,
        arrayFilters: [{ 'elem.notificationSeen': false }]
      }
    );
    const user = await getUser(id);
    return user;
  } catch (err) {
    logger.error(`user-dao: failed to add activity for user ${id}`);
    logger.error(err);
    throw err;
  }
}

export async function getUserByHashedEmail(hashedEmail) {
  try {
    const col = await db().collection(COL_NAME);
    const user = await col.findOne(
      { hashedEmails: hashedEmail },
      {
        id: 1,
        email: 1
      }
    );
    if (!user) return null;
    return user;
  } catch (err) {
    logger.error('user-dao: failed to update unsub status');
    logger.error(err);
    throw err;
  }
}

export async function verifyEmail(id) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $set: {
          verified: true,
          lastUpdatedAt: isoDate()
        },
        $unset: {
          verificationCode: 1
        }
      }
    );
    const user = await getUser(id);
    return user;
  } catch (err) {
    logger.error('user-dao: failed to verify email');
    logger.error(err);
    throw err;
  }
}

function decryptUser(user, options = {}) {
  let decryptedUser = {
    ...user,
    // decrypt unsub info
    unsubscriptions: decryptUnsubscriptions(
      user.unsubscriptions,
      encryptedUnsubCols
    )
  };
  // don't return account keys unless specified
  if (options.withAccountKeys) {
    decryptedUser = {
      ...decryptedUser,
      accounts: user.accounts.map(({ id, provider, email, addedAt, keys }) => ({
        id,
        provider,
        email,
        addedAt,
        keys: {
          ...keys,
          refreshToken: decrypt(keys.refreshToken),
          accessToken: decrypt(keys.accessToken)
        }
      }))
    };
  } else {
    decryptedUser = {
      ...decryptedUser,
      accounts: user.accounts.map(({ id, provider, email, addedAt }) => ({
        id,
        provider,
        email,
        addedAt
      }))
    };
  }
  return decryptedUser;
}

function encryptKeys(keys) {
  return {
    ...keys,
    accessToken: encrypt(keys.accessToken),
    refreshToken: encrypt(keys.refreshToken)
  };
}
