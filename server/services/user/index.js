import {
  addAccount,
  addActivity,
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
  incrementUnsubscribesRemaining,
  incrementUserReferralBalance,
  removeAccount,
  removeBillingCard,
  removeScanReminder,
  removeTotpSecret,
  removeUser,
  resolveUnsubscription,
  setMilestoneCompleted,
  setNotificationsRead,
  updateIgnoreList,
  updatePaidScan,
  updatePassword,
  updateUnsubStatus,
  updateUser,
  updateUserWithAccount,
  verifyTotpSecret
} from '../../dao/user';
import {
  addNewsletterUnsubscriptionToStats,
  addReferralSignupToStats,
  addReminderRequestToStats,
  addRewardGivenToStats,
  addUnsubStatusToStats,
  addUserAccountDeactivatedToStats,
  addUserToStats
} from '../stats';
import {
  addUpdateSubscriber as addUpdateNewsletterSubscriber,
  removeSubscriber as removeNewsletterSubscriber
} from '../../utils/emails/newsletter';
import {
  addUserToOrganisation,
  getOrganisationByInviteCode
} from '../organisation';
import { getMilestone, updateMilestoneCompletions } from '../milestones';

import addMonths from 'date-fns/add_months';
// import { addReferralToReferrer } from '../referral';
import addWeeks from 'date-fns/add_weeks';
import { detachPaymentMethod } from '../../utils/stripe';
import { listPaymentsForUser } from '../payments';
import logger from '../../utils/logger';
import { revokeToken as revokeTokenFromGoogle } from '../../utils/gmail';
import { revokeToken as revokeTokenFromOutlook } from '../../utils/outlook';
import { sendToUser } from '../../rest/socket';
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
  const {
    id,
    email,
    referralCode,
    inviteCode,
    profileImg,
    displayName
  } = userData;
  try {
    let user = await getUser(id);
    const organisation = await getOrganisation(inviteCode, email);
    if (!user) {
      const referredBy = await getReferrer(referralCode);
      user = await createUser(
        {
          id,
          name: displayName,
          email,
          profileImg,
          referredBy,
          organisationId: organisation ? organisation.id : null,
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
      if (referredBy) {
        addReferralActivity({ userId: id, referralUserId: referredBy });
      }
      addUserToStats();
      addUpdateNewsletterSubscriber(email);
      // signing up with a provider counts as connecting the first account
      addActivityForUser(id, 'connectedFirstAccount', {
        id,
        provider
      });
    } else {
      user = await updateUserWithAccount(
        { id, email },
        {
          profileImg,
          name: displayName,
          organisationId: organisation ? organisation.id : null
        },
        keys
      );
    }

    // signing up or logging in with a provider counts as connecting
    // an account so we check the org stuff here
    if (organisation) {
      logger.debug(
        `user-service: adding user ${user.id} to organisation ${
          organisation.id
        }`
      );
      await addUserToOrganisation(organisation.id, {
        userId: user.id,
        email: user.email
      });
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

export async function updateUserOrganisation(
  userId,
  { organisationId, admin = false }
) {
  try {
    const user = await updateUser(userId, {
      organisationId: organisationId,
      organisationAdmin: admin
    });
    return user;
  } catch (err) {
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
  const { id: accountId, email, profileImg, displayName } = userData;
  try {
    let user = await getUser(userId);
    const isAccountAlreadyConnected = user.accounts.find(
      acc => acc.id === accountId
    );

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
        id: accountId,
        provider,
        email,
        keys
      });
      addConnectAccountActivity(accountId, provider, user);

      logger.debug(
        `user-service: user ${user.id} belongs to an organisation ${
          user.organisationId
        }, adding account...`
      );
      if (!user.organisationId) {
        await addUserToOrganisation(user.organisationId, {
          userId: user.id,
          email: user.email
        });
      }
    }
    return user;
  } catch (err) {
    logger.error(
      `user-service: error connecting user ${provider} account ${accountId}`
    );
    logger.error(err);
    throw err;
  }
}

export async function createOrUpdateUserFromPassword(userData = {}) {
  const {
    id,
    email,
    referralCode,
    inviteCode,
    displayName,
    password
  } = userData;
  let user;
  try {
    const organisation = await getOrganisation(inviteCode, email);
    if (!id) {
      const referredBy = await getReferrer(referralCode);
      user = await createUserFromPassword({
        name: displayName,
        email,
        password,
        referredBy,
        organisationId: organisation ? organisation.id : null,
        loginProvider: 'password',
        token: v4(),
        accounts: []
      });
      if (referredBy) {
        await addReferralActivity({ userId: id, referralUserId: referredBy });
      }
      addUserToStats();
      addUpdateNewsletterSubscriber(email);
    } else {
      user = await updateUser(id, {
        name: displayName,
        organisationId: organisation ? organisation.id : null
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

async function getReferrer(referralCode) {
  if (!referralCode) return null;
  const { id: referralUserId } = await getUserByReferralCode(referralCode);
  return referralUserId;
}

async function getOrganisation(inviteCode, email) {
  if (!inviteCode) return null;

  const organisation = await getOrganisationByInviteCode(inviteCode);
  if (!organisation) return null;

  const { allowAnyUserWithCompanyEmail, invitedUsers, domain } = organisation;

  const invited = invitedUsers.includes(email);

  // we always allow invited users
  if (invited) {
    logger.info(
      `user-service: user is invited to organisation ${organisation.id}`
    );
    return organisation;
  }

  // if not invited and allowed company domains
  if (allowAnyUserWithCompanyEmail) {
    const userEmailDomain = email.split('@')[1];
    if (userEmailDomain === domain) {
      logger.info(
        `user-service: user email belongs to organisation with allow user with company email ${
          organisation.id
        }`
      );
      return organisation;
    }
  }

  // user is not invited and their domain does not match the company
  logger.info(
    `user-service: user is not allowed to join the organisation ${
      organisation.id
    }`
  );
  return null;
}

async function addReferralActivity({ userId, referralUserId }) {
  try {
    // add sign up reward for this user
    addActivityForUser(userId, 'signedUpFromReferral', {
      id: userId
    });
    // add sign up rewards for other user
    addActivityForUser(referralUserId, 'referralSignUp', {
      id: referralUserId
    });
    addReferralSignupToStats();
  } catch (err) {
    logger.error(
      `user-service: error adding referral activity for user ${userId}, referral user ${referralUserId}`
    );
    throw err;
  }
}

function addConnectAccountActivity(
  accountId,
  provider,
  { id: userId, loginProvider, accounts }
) {
  let activityName;
  if (loginProvider === 'password') {
    // if logged in with password the first account will be 1 in the accounts array
    activityName =
      accounts.length === 1
        ? 'connectedFirstAccount'
        : 'connectedAdditionalAccount';
  } else {
    // otherwise we already know this is a new account being connected
    activityName = 'connectedAdditionalAccount';
  }
  addActivityForUser(userId, activityName, {
    id: accountId,
    provider
  });
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
  const { to, from, id, date } = mail;
  return addUnsubscription(userId, {
    to,
    from,
    id,
    date,
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
    const user = await addPackage(userId, packageId, unsubscribes);
    addActivityForUser(userId, 'packagePurchase', {
      id: packageId,
      unsubscribes
    });
    return user;
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
    const { referralCode, referrals, referredBy } = await getUserById(id);
    return { referralCode, referrals, referredBy };
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
    const updatedUser = await removeAccount(userId, { accountId, email });
    addActivityForUser(userId, 'removeAdditionalAccount', {
      id: accountId,
      provider
    });
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
    addActivityForUser(user.id, 'addedTwoFactorAuth');
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

export async function addActivityForUser(userId, name, data = {}) {
  try {
    logger.debug(`user-service: adding activity ${name}`);

    let activityData = {
      type: name,
      data
    };

    const milestone = await getMilestone(name);

    // TODO improve nested IF statements
    if (milestone && milestone.hasReward) {
      logger.debug(
        `user-service: activity ${name} has reward, checking if user is eligible`
      );

      // check if they are eligible for the reward
      const { activity = [] } = await getUserById(userId);
      const reward = getReward({
        userActivity: activity,
        name,
        milestone,
        activityData
      });

      if (reward) {
        const { unsubscriptions } = milestone;
        logger.debug(
          `user-service: adding reward of ${unsubscriptions} to user ${userId}`
        );
        activityData = {
          ...activityData,
          ...reward
        };

        // give the user the unsubs
        await incrementUnsubscribesRemaining(userId, unsubscriptions);
        addRewardGivenToStats(unsubscriptions);
      }

      await setUserMilestoneCompleted(userId, name);
    }

    // add the activity to the array
    const activity = await addActivity(userId, activityData);
    if (activity.notification) {
      sendToUser(userId, 'notifications', [activity]);
    }
    if (activity.reward) {
      sendToUser(userId, 'credits', activity.reward.unsubscriptions);
    }
  } catch (err) {
    throw err;
  }
}

function getReward({ userActivity, name, milestone, activityData }) {
  const { maxRedemptions, unsubscriptions } = milestone;

  // conditions for reward
  // 1. user has not yet completed reward
  // 2. reward redemptions has not been reached and not been rewarded for the same data before
  // 3. reward has no max redemptions but has not been rewarded with the same data before
  let giveReward = false;

  const userActivityCompletionCount = userActivity.filter(a => a.type === name)
    .length;
  if (!userActivityCompletionCount) {
    // if the user has not yet completed the activity reward them
    giveReward = true;
  } else if (
    (maxRedemptions && userActivityCompletionCount < maxRedemptions) ||
    !maxRedemptions
  ) {
    // if the users redemptions are under the max or there are no max check the reward is not being gamed
    giveReward = checkReward({
      userActivity,
      activityData
    });
  }

  if (!giveReward) return null;

  logger.debug(`user-service: conditions for reward met for activity ${name}`);
  return {
    reward: {
      unsubscriptions
    },
    // if it's a reward we add a notification
    // TODO what other use cases do we need to do this for?
    notification: {
      seen: false
    }
  };
}

function checkReward({ userActivity, activityData }) {
  const { type, data } = activityData;

  switch (type) {
    // connectedAdditionalAccount can only be done once per additional email
    case 'connectedAdditionalAccount': {
      const alreadyConnected = userActivity.find(
        a => a.type === type && a.data.id === data.id
      );
      if (alreadyConnected) {
        logger.debug(
          `user-service: user already redeemed reward for connecting this account`
        );
        return false;
      }
      return true;
    }
    // referralSignUp will only be rewarded once for each user that signed up
    case 'referralSignUp': {
      // TODO implement properly
      const alreadyReferred = userActivity.find(
        a => a.type === type && a.data.id === data.id
      );
      if (alreadyReferred) {
        logger.debug(
          `user-service: user already redeemed reward for referring this person`
        );
        return false;
      }
      return true;
    }
    // referralPurchase will only be rewarded once for each user that purchases
    case 'referralPurchase': {
      // TODO implement properly
      const alreadyPurchased = userActivity.find(
        a => a.type === type && a.data.id === data.id
      );
      if (alreadyPurchased) {
        logger.debug(
          `user-service: user already redeemed reward for their referee purchasing a package`
        );
        return false;
      }
      return true;
    }
    default: {
      logger.debug(
        `user-service: cannot check reward, reward not found ${type}`
      );
      return false;
    }
  }
}

export async function getUserActivity(userId) {
  try {
    const user = await getUserById(userId);
    if (!user) return null;
    return user.activity;
  } catch (err) {
    throw err;
  }
}

export async function getUserNotifications(userId, { seen } = {}) {
  try {
    const user = await getUserById(userId);
    if (!user) return null;
    return user.activity.filter(a => {
      if (seen === true || seen === false) {
        return a.notification && a.notification.seen === seen;
      }
      return a.notification;
    });
  } catch (err) {
    throw err;
  }
}

export function setNotificationsReadForUser(userId, activityIds = []) {
  logger.debug(`user-service: setting notifications read for user ${userId}`);
  return setNotificationsRead(userId, activityIds);
}
