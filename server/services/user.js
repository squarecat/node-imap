import { v4 } from 'node-uuid';
import addWeeks from 'date-fns/add_weeks';
import addMonths from 'date-fns/add_months';

import {
  getUser,
  createUser,
  updateUser,
  addUnsubscription,
  addScan,
  resolveUnsubscription,
  addPaidScan,
  updatePaidScan,
  updateIgnoreList,
  addScanReminder,
  removeScanReminder,
  getUserByReferralCode
} from '../dao/user';

import { updateCoupon } from './payments';
import { addUserToStats } from './stats';
import { addReferralToReferrer } from './referral';

import logger from '../utils/logger';

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

export async function createOrUpdateUserFromGoogle(userData = {}, keys) {
  try {
    const { id, emails, referralCode, photos = [] } = userData;

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
