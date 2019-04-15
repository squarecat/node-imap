import {
  addNewsletterUnsubscriptionToStats,
  addReferralSignupToStats,
  addReminderRequestToStats,
  addUnsubStatusToStats,
  addUserAccountDeactivatedToStats,
  addUserToStats
} from './stats';
import {
  addPaidScan,
  addScan,
  addScanReminder,
  addUnsubscription,
  createUser,
  disconnectAccount,
  getUser,
  getUserByEmail,
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
  addUpdateSubscriber as addUpdateNewsletterSubscriber,
  removeSubscriber as removeNewsletterSubscriber
} from '../utils/emails/newsletter';

import addMonths from 'date-fns/add_months';
import { addReferralToReferrer } from './referral';
import addWeeks from 'date-fns/add_weeks';
import { listPaymentsForUser } from './payments';
import logger from '../utils/logger';
import { revokeToken as revokeTokenFromGoogle } from '../utils/gmail';
import { revokeToken as revokeTokenFromOutlook } from '../utils/outlook';
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
      addUpdateNewsletterSubscriber(email);
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
      addUserToStats();
      addUpdateNewsletterSubscriber(email);
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
  try {
    const { email, preferences: currentPreferences } = await getUserById(id);

    if (preferences.marketingConsent !== currentPreferences.marketingConsent) {
      logger.info(
        `user-service: marketing consent changed for ${id} to ${
          preferences.marketingConsent
        }`
      );
      addUpdateNewsletterSubscriber(email, {
        subscribed: preferences.marketingConsent
      });
    }
    return updateUser(id, {
      preferences: {
        ...currentPreferences,
        ...preferences
      }
    });
  } catch (err) {
    throw err;
  }
}

export async function unsubscribeUserFromNewsletter(email) {
  addNewsletterUnsubscriptionToStats();
  return updateUserMarketingConsent(email, false);
}

export async function updateUserMarketingConsent(
  email,
  marketingConsent = true
) {
  try {
    const user = await getUserByEmail(email);
    if (!user) return null;

    const { id } = user;

    return updateUserPreferences(id, {
      marketingConsent
    });
  } catch (err) {
    logger.error(`user-service: failed to update user prefs by email`);
    throw err;
  }
}

export async function deactivateUserAccount(user) {
  const { id, email, provider, keys } = user;
  const { refreshToken } = keys;
  logger.info(`user-service: deactivating user account ${id}`);

  try {
    if (provider === 'google') {
      await revokeTokenFromGoogle(refreshToken);
    } else if (provider === 'outlook') {
      await revokeTokenFromOutlook(refreshToken);
    }
    await removeUser(id);
    removeNewsletterSubscriber(email);
    addUserAccountDeactivatedToStats();
  } catch (err) {
    logger.error(`user-service: error deactivating user account ${id}`);
    throw err;
  }
}

export function updateUserUnsubStatus(userId, { mailId, status, message }) {
  try {
    addUnsubStatusToStats(status);
    return updateUnsubStatus(userId, { mailId, status, message });
  } catch (err) {
    logger.error(
      `user-service: failed to update unsub status for user ${userId} and mail ${mailId}`
    );
    throw err;
  }
}

export async function disconnectUserAccount(user, email) {
  const { id: userId, accounts } = user;

  try {
    const account = accounts.find(e => e.email === email);
    const { id: accountId, provider, keys } = account;
    const { refreshToken } = keys;

    if (provider === 'google') {
      await revokeTokenFromGoogle(refreshToken);
    } else if (provider === 'outlook') {
      await revokeTokenFromOutlook(refreshToken);
    }
    return disconnectAccount(userId, accountId);
  } catch (err) {
    logger.error(
      `user-service: failed to disconnect user account for user ${userId}`
    );
    throw err;
  }
}
