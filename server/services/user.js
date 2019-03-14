import {
  addPaidScan,
  addScan,
  addScanReminder,
  addUnsubscription,
  createUser,
  getUser,
  getUserByReferralCode,
  incrementUserReferralBalance,
  removeScanReminder,
  removeUser,
  resolveUnsubscription,
  updateIgnoreList,
  updatePaidScan,
  updateUnsubStatus,
  updateUser
} from '../dao/user';
import {
  addReferralSignupToStats,
  addReminderRequestToStats,
  addUserAccountDeactivatedToStats,
  addUserToStats
} from './stats';

import addMonths from 'date-fns/add_months';
import { addReferralToReferrer } from './referral';
import addWeeks from 'date-fns/add_weeks';
import { listPaymentsForUser } from './payments';
import logger from '../utils/logger';
import { removeSubscriber } from '../utils/mailchimp';
import { revokeToken } from '../utils/google';
import { v4 } from 'node-uuid';

export async function getUserById(id) {
  try {
    let user = await getUser(id);
    return user;
  } catch (err) {
    logger.error(`user-service: error getting user by id ${id}`);
    logger.error(err);
    throw err;
  }
}

export async function createOrUpdateUserFromOutlook(userData = {}, keys) {
  const { id, email, referralCode, photos = [], displayName } = userData;
  try {
    const profileImg = photos.length ? photos[0].value : null;
    let user = await getUser(id);
    if (!user) {
      let referredBy = null;
      if (referralCode) {
        const { id: referralUserId } = await getUserByReferralCode(
          referralCode
        );
        await addReferralToReferrer(referralUserId, { userId: id });
        addReferralSignupToStats();
        referredBy = referralUserId;
      }
      user = await createUser({
        id,
        name: displayName,
        email,
        profileImg,
        keys,
        referredBy,
        provider: 'outlook',
        token: v4()
      });
      addUserToStats();
    } else {
      user = await updateUser(id, {
        keys,
        profileImg,
        name: displayName
      });
    }
    return user;
  } catch (err) {
    logger.error(
      `user-service: error creating or updating user from Google ${id ||
        'no userData id'}`
    );
    logger.error(err);
    throw err;
  }
}

export async function createOrUpdateUserFromGoogle(userData = {}, keys) {
  const { id, email, referralCode, photos = [], displayName } = userData;
  try {
    const profileImg = photos.length ? photos[0].value : null;
    let user = await getUser(id);
    if (!user) {
      let referredBy = null;
      if (referralCode) {
        const { id: referralUserId } = await getUserByReferralCode(
          referralCode
        );
        await addReferralToReferrer(referralUserId, { userId: id });
        addReferralSignupToStats();
        referredBy = referralUserId;
      }
      user = await createUser({
        id,
        name: displayName,
        email,
        profileImg,
        keys,
        referredBy,
        provider: 'google',
        token: v4()
      });
      // addSubscriber({ email });
      addUserToStats();
    } else {
      user = await updateUser(id, {
        keys,
        profileImg,
        name: displayName
      });
    }
    return user;
  } catch (err) {
    logger.error(
      `user-service: error creating or updating user from Google ${id ||
        'no userData id'}`
    );
    logger.error(err);
    throw err;
  }
}

export async function updateUserToken(id, keys) {
  try {
    const user = await updateUser(id, {
      keys
    });
    return user;
  } catch (err) {
    logger.error(
      `user-service: error updating user refresh token ${id ||
        'no userData id'}`
    );
    logger.error(err);
    throw err;
  }
}

export async function checkAuthToken(userId, token) {
  try {
    let user = await getUser(userId);
    if (!user || user.token !== token) {
      return false;
    }
    return true;
  } catch (err) {
    logger.error(`user-service: error checking auth token for user ${userId}`);
    logger.error(err);
    throw err;
  }
}

// google date is the legacy version of the date object
export async function addUnsubscriptionToUser(userId, { mail, ...rest }) {
  const { to, from, id, date, googleDate } = mail;
  return addUnsubscription(userId, {
    to,
    from,
    id,
    date: date || googleDate,
    ...rest
  });
}

export function addScanToUser(userId, scanData) {
  return addScan(userId, scanData);
}

export async function resolveUserUnsubscription(userId, mailId) {
  return resolveUnsubscription(userId, mailId);
}

export async function updateCustomerId(userId, customerId) {
  return updateUser(userId, { customerId });
}

export function addPaidScanToUser(userId, scanType) {
  return addPaidScan(userId, scanType);
}

export function updatePaidScanForUser(userId, scanType) {
  return updatePaidScan(userId, scanType);
}

export async function addToUserIgnoreList(id, email) {
  try {
    return updateIgnoreList(id, { action: 'add', value: email });
  } catch (err) {
    throw err;
  }
}
export async function removeFromUserIgnoreList(id, email) {
  try {
    return updateIgnoreList(id, { action: 'remove', value: email });
  } catch (err) {
    throw err;
  }
}

export async function addUserScanReminder(id, timeframe) {
  try {
    const now = new Date();
    let remindAt = null;
    if (timeframe === '1w') {
      remindAt = addWeeks(now, 1);
    } else if (timeframe === '1m') {
      remindAt = addMonths(now, 1);
    } else if (timeframe === '6m') {
      remindAt = addMonths(now, 6);
    }
    if (!remindAt) {
      throw new Error('invalid scan reminder timeframe');
    }
    addReminderRequestToStats();
    return addScanReminder(id, { timeframe, remindAt });
  } catch (err) {
    throw err;
  }
}

export function removeUserScanReminder(id) {
  return removeScanReminder(id);
}

export async function getReferralStats(id) {
  try {
    const { referralCode, referrals, referralBalance } = await getUserById(id);
    return { referralCode, referrals, referralBalance };
  } catch (err) {
    throw err;
  }
}

export async function creditUserAccount(id, { amount }) {
  return incrementUserReferralBalance(id, amount);
}

export async function getUserPayments(id) {
  return listPaymentsForUser(id);
}

export async function updateUserPreferences(id, preferences) {
  return updateUser(id, { preferences });
}

export async function deactivateUserAccount(user) {
  const { id, email, keys } = user;
  const { refreshToken } = keys;
  logger.info(`user-service: deactivating user account ${id}`);

  try {
    await revokeToken(refreshToken);
    await removeSubscriber({ email });
    await removeUser(id);
    addUserAccountDeactivatedToStats();
  } catch (err) {
    logger.error(`user-service: error deactivating user account ${id}`);
    throw err;
  }
}

export function updateUserUnsubStatus(userId, { mailId, status, message }) {
  try {
    return updateUnsubStatus(userId, { mailId, status, message });
  } catch (err) {
    logger.error(
      `user-service: failed to update ubsub status for user ${userId} and mail ${mailId}`
    );
    throw err;
  }
}
