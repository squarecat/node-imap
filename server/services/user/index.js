import {
  addAccount,
  addPackage,
  addPaidScan,
  addScan,
  addScanReminder,
  addTotpSecret,
  addUnsubscription,
  authenticate,
  createUser,
  createUserFromPassword,
  getLoginProvider,
  getTotpSecret,
  getUser,
  getUserByEmail,
  getUserByReferralCode,
  incrementUserReferralBalance,
  removeAccount,
  removeBillingCard,
  removeScanReminder,
  removeTotpSecret,
  removeUser,
  resolveUnsubscription,
  updateIgnoreList,
  updatePaidScan,
  updatePassword,
  updateUnsubStatus,
  updateUser,
  updateUserWithAccount,
  verifyTotpSecret,
  setMilestoneCompleted
} from '../../dao/user';
import {
  addNewsletterUnsubscriptionToStats,
  addReferralSignupToStats,
  addReminderRequestToStats,
  addUnsubStatusToStats,
  addUserAccountDeactivatedToStats,
  addUserToStats
} from '../stats';
import {
  addUpdateSubscriber as addUpdateNewsletterSubscriber,
  removeSubscriber as removeNewsletterSubscriber
} from '../../utils/emails/newsletter';

import { addActivityForUser } from './activity';
import addMonths from 'date-fns/add_months';
import { addReferralToReferrer } from '../referral';
import addWeeks from 'date-fns/add_weeks';
import { detachPaymentMethod } from '../../utils/stripe';
import { listPaymentsForUser } from '../payments';
import { updateMilestoneCompletions } from '../milestones';
import logger from '../../utils/logger';
import { revokeToken as revokeTokenFromGoogle } from '../../utils/gmail';
import { revokeToken as revokeTokenFromOutlook } from '../../utils/outlook';
import speakeasy from 'speakeasy';
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

export function createOrUpdateUserFromOutlook(userData = {}, keys) {
  return createOrUpdateUser(userData, keys, 'outlook');
}

export function createOrUpdateUserFromGoogle(userData = {}, keys) {
  return createOrUpdateUser(userData, keys, 'google');
}

async function createOrUpdateUser(userData = {}, keys, provider) {
  const { id, email, referralCode, profileImg, displayName } = userData;
  try {
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
      user = await createUser(
        {
          id,
          name: displayName,
          email,
          profileImg,
          referredBy,
          loginProvider: provider,
          token: v4()
        },
        {
          id,
          provider,
          email,
          keys
        }
      );
      addUserToStats();
      addUpdateNewsletterSubscriber(email);
      // signing in with a provider counts as connecting the first account
      // TODO combine this with create user?
      user = await addActivityForUser(id, 'connectedFirstAccount', {
        id,
        provider
      });
    } else {
      user = await updateUserWithAccount(
        { id, email },
        {
          profileImg,
          name: displayName
        },
        keys
      );
    }

    return user;
  } catch (err) {
    logger.error(
      `user-service: error creating or updating user from ${provider} with ${id}`
    );
    logger.error(err);
    throw err;
  }
}

export function connectUserOutlookAccount(userId, userData = {}, keys) {
  return connectUserAccount(userId, userData, keys, 'outlook');
}

export function connectUserGoogleAccount(userId, userData = {}, keys) {
  return connectUserAccount(userId, userData, keys, 'google');
}

async function connectUserAccount(userId, userData = {}, keys, provider) {
  const { id, email, profileImg, displayName } = userData;
  try {
    let user = await getUser(userId);
    const isAccountAlreadyConnected = user.accounts.find(acc => acc.id === id);

    if (isAccountAlreadyConnected) {
      logger.debug(
        `user-service: ${provider} account already connected, updating...`
      );
      user = await updateUser(
        { userId, 'accounts.email': email },
        {
          'accounts.$.keys': keys,
          profileImg,
          name: displayName
        }
      );
    } else {
      logger.debug(
        `user-service: ${provider} account not connected, adding...`
      );
      user = await addAccount(userId, {
        id,
        provider,
        email,
        keys
      });

      let activityName;
      if (user.loginProvider === 'password') {
        // if logged in with password the first account will be 0 in the accounts array
        activityName = user.accounts.length
          ? 'connectedAdditionalAccount'
          : 'connectedFirstAccount';
      } else {
        // otherwise we already know this is a new account being connected
        activityName = 'connectedAdditionalAccount';
      }

      user = await addActivityForUser(userId, activityName, {
        id,
        provider
      });
    }
    return user;
  } catch (err) {
    logger.error(
      `user-service: error connecting user ${provider} account ${id}`
    );
    logger.error(err);
    throw err;
  }
}

export async function createOrUpdateUserFromPassword(userData = {}) {
  const { id, email, referralCode, displayName, password } = userData;
  let user;
  try {
    if (!id) {
      let referredBy = null;
      if (referralCode) {
        const { id: referralUserId } = await getUserByReferralCode(
          referralCode
        );
        await addReferralToReferrer(referralUserId, { userId: id });
        addReferralSignupToStats();
        referredBy = referralUserId;
      }
      user = await createUserFromPassword({
        id,
        name: displayName,
        email,
        password,
        referredBy,
        loginProvider: 'password',
        token: v4(),
        accounts: []
      });
      addUserToStats();
      addUpdateNewsletterSubscriber(email);
    } else {
      user = await updateUser(id, {
        name: displayName
      });
    }
    return user;
  } catch (err) {
    logger.error(
      `user-service: error creating or updating user from Username & Password`
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

// TODO will be legacy
export function addScanToUser(userId, scanData) {
  return addScan(userId, scanData);
}

export async function resolveUserUnsubscription(userId, mailId) {
  return resolveUnsubscription(userId, mailId);
}

export async function updateCustomerId(userId, customerId) {
  return updateUser(userId, { customerId });
}

// TODO will be legacy
export function addPaidScanToUser(userId, scanType) {
  return addPaidScan(userId, scanType);
}

export async function addPackageToUser(userId, packageId, unsubscribes = 0) {
  try {
    await addPackage(userId, packageId, unsubscribes);
    return addActivityForUser(userId, 'packagePurchase', {
      id: packageId,
      unsubscribes
    });
  } catch (err) {
    throw err;
  }
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

export async function updateUserPassword({ id, email, password }, newPassword) {
  try {
    await authenticateUser({ email, password });
    const updatedUser = await updatePassword(id, newPassword);
    return updatedUser;
  } catch (err) {
    logger.error(`user-service: failed to update user password`);
    logger.error(err);
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

export async function removeUserAccount(user, email) {
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
    await removeAccount(userId, accountId);
    // do not wait for this one as won't be a notification
    const updatedUser = await addActivityForUser(
      userId,
      'removeAdditionalAccount',
      {
        id: accountId,
        provider
      }
    );
    return updatedUser;
  } catch (err) {
    logger.error(
      `user-service: failed to disconnect user account for user ${userId}`
    );
  }
}

export async function authenticateUser({ email, password }) {
  try {
    const user = await authenticate({ email, password });
    if (user === null) throw new Error('user not found or password incorrect');
    return user;
  } catch (err) {
    throw err;
  }
}

export async function getUserLoginProvider({ email }) {
  try {
    return getLoginProvider(email);
  } catch (err) {
    throw err;
  }
}

export async function authenticationRequiresTwoFactor(user) {
  return user.password && user.password.totpSecret && !user.password.unverified;
}

export async function createUserTotpToken(user) {
  const { base32, ascii } = speakeasy.generateSecret();
  const otpauth_url = speakeasy.otpauthURL({
    secret: ascii,
    label: `Leave Me Alone:${user.email}`
  });
  try {
    await addTotpSecret(user.id, { secret: base32, unverified: true });
    return { otpauth_url, base32 };
  } catch (err) {
    throw err;
  }
}
export async function verifyUserTotpToken(user, { token }) {
  const { secret, unverified } = await getTotpSecret(user.id);
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token
  });
  if (unverified) {
    verifyTotpSecret(user.id);
  }
  return verified;
}

export async function removeUserTotpToken(user) {
  try {
    return removeTotpSecret(user.id);
  } catch (err) {
    throw err;
  }
}

export async function removeUserBillingCard(id) {
  try {
    const { paymentMethodId } = await getUserById(id);
    if (paymentMethodId) {
      await detachPaymentMethod(paymentMethodId);
    }
    const user = await removeBillingCard(id);
    // do not wait for this one as won't be a notification
    addActivityForUser(id, 'removeBillingCard');
    return user;
  } catch (err) {
    throw err;
  }
}

export async function setUserMilestoneCompleted(userId, milestoneName) {
  try {
    await updateMilestoneCompletions(milestoneName);
    return setMilestoneCompleted(userId, milestoneName);
  } catch (err) {
    throw err;
  }
}
