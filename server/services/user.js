import {
  addPaidScan,
  addScan,
  addScanReminder,
  addUnsubscription,
  createUser,
  getUser,
  getUserByReferralCode,
  removeScanReminder,
  removeUser,
  resolveUnsubscription,
  updateIgnoreList,
  updatePaidScan,
  updateUser
} from '../dao/user';
import {
  addReferralSignupToStats,
  addReminderRequestToStats,
  addUserAccountDeactivatedToStats,
  addUserToStats
} from './stats';
import { addSubscriber, removeSubscriber } from '../utils/mailchimp';
import { listPaymentsForUser, updateCoupon } from './payments';

import addMonths from 'date-fns/add_months';
import { addReferralToReferrer } from './referral';
import addWeeks from 'date-fns/add_weeks';
import logger from '../utils/logger';
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
  const { id, emails, referralCode, photos = [], displayName } = userData;
  try {
    const profileImg = photos.length ? photos[0].value : null;
    const { value: email } = emails[0]; // fixme is this correct, could be?
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
      addSubscriber({ email });
      addUserToStats();
    } else {
      user = await updateUser(id, {
        keys,
        profileImg
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
  const { id, emails, referralCode, photos = [] } = userData;
  try {
    const profileImg = photos.length ? photos[0].value : null;
    const { value: email } = emails.find(e => e.type === 'account');
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
        email,
        profileImg,
        keys,
        referredBy,
        token: v4()
      });
      addSubscriber({ email });
      addUserToStats();
    } else {
      user = await updateUser(id, {
        keys,
        profileImg
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

export async function addUnsubscriptionToUser(userId, { mail, ...rest }) {
  const { to, from, id, googleDate } = mail;
  return addUnsubscription(userId, { to, from, id, googleDate, ...rest });
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

export async function addFreeScan(userId, scanType, coupon) {
  try {
    await addPaidScanToUser(userId, scanType);
    if (coupon) updateCoupon(coupon);
    return true;
  } catch (err) {
    throw err;
  }
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
  return updateUser(id, { $inc: { referralBalance: amount } });
}

export async function getUserPayments(id) {
  return listPaymentsForUser(id);
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
