import {
  addAccount,
  addActivity,
  addPackage,
  addPaidScan,
  addReferral,
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
  getUserByHashedEmail,
  incrementCredits,
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
import { sendReferralInviteMail } from '../../utils/emails/transactional';
import {
  addUserToOrganisation,
  canUserJoinOrganisation,
  getOrganisationById,
  getOrganisationByInviteCode,
  getOrganisationByInvitedEmailOrValidDomain,
  removeUserFromOrganisation
} from '../organisation';
import { getMilestone, updateMilestoneCompletions } from '../milestones';

import { ConnectAccountError, AuthError } from '../../utils/errors';
import addMonths from 'date-fns/add_months';
import addWeeks from 'date-fns/add_weeks';
import addHours from 'date-fns/add_hours';

import { detachPaymentMethod } from '../../utils/stripe';
import { listPaymentsForUser } from '../payments';
import logger from '../../utils/logger';
import { revokeToken as revokeTokenFromGoogle } from '../../utils/gmail';
import { revokeToken as revokeTokenFromOutlook } from '../../utils/outlook';
import { sendToUser } from '../../rest/socket';
import speakeasy from 'speakeasy';
import { v4 } from 'node-uuid';
import shortid from 'shortid';
import { sendForgotPasswordMail } from '../../utils/emails/forgot-password';

export async function getUserById(id) {
  try {
    let user = await getUser(id);
    if (!user) return null;
    if (user.organisationId) {
      const { name, active } = await getOrganisationById(user.organisationId);
      user = {
        ...user,
        organisationName: name,
        organisationActive: active
      };
    }
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
    let organisation;
    if (!user) {
      logger.debug(`user-service: creating new user`);
      // new user account, check if they should be added to an org
      organisation = await getOrganisationForUserEmail(inviteCode, email);
      if (organisation) {
        logger.debug(
          `user-service: new user is invited to or has domain for org ${
            organisation.id
          }, adding...`
        );
      }
      const referredBy = await getReferrer(referralCode);
      user = await createUser(
        {
          id,
          name: displayName,
          email,
          profileImg,
          referredBy: referredBy ? referredBy.id : null,
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
        addReferralActivity({ user, referralUser: referredBy });
      }
      addUserToStats();
      addUpdateNewsletterSubscriber(email);
      // signing up with a provider counts as connecting the first account
      addActivityForUser(id, 'connectedFirstAccount', {
        id,
        provider
      });
    } else {
      logger.debug(`user-service: updating user ${id}`);
      let updates = {
        profileImg,
        name: displayName
      };
      if (!user.organisationId) {
        logger.debug(
          `user-service: user ${id} not a member of an organisation, checking if they should be...`
        );
        // if the user is not already a member of an org see if they should be
        organisation = await getOrganisationForUserEmail(inviteCode, email);
        if (organisation) {
          logger.debug(
            `user-service: user ${id} is invited to or has domain for org ${
              organisation.id
            }, adding...`
          );
          updates = {
            ...updates,
            organisationId: organisation.id
          };
        }
      }
      user = await updateUserWithAccount({ id, email }, updates, keys);
    }

    // signing up or logging in with a provider counts as connecting
    // an account so we add this account to the organisation to be billed
    if (organisation) {
      await addCreatedOrUpdatedUserToOrganisation({
        user,
        organisation
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

async function addCreatedOrUpdatedUserToOrganisation({ user, organisation }) {
  try {
    logger.debug(
      `user-service: adding created or updated user ${
        user.id
      } to organisation ${organisation.id}`
    );

    // remove all the accounts which are not the primary account
    logger.debug(`user-service: removing user ${user.id} connected accounts`);
    await Promise.all(
      user.accounts.map(a => {
        if (a.email === user.email) {
          return true;
        }
        return removeUserAccount(user, a.email);
      })
    );

    await addUserToOrganisation(organisation.id, {
      email: user.email
    });

    addActivityForUser(user.id, 'addedToOrganisation', {
      id: organisation.id,
      name: organisation.name,
      email: user.email
    });
  } catch (err) {
    throw err;
  }
}

async function addUserAccountToOrganisation({ user, account, organisation }) {
  try {
    logger.debug(
      `user-service: adding user account ${account.id} to organisation ${
        organisation.id
      }`
    );

    await addUserToOrganisation(organisation.id, {
      email: account.email
    });

    addActivityForUser(user.id, 'addedToOrganisation', {
      id: organisation.id,
      name: organisation.name,
      email: account.email
    });
  } catch (err) {
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
    const user = await getUser(userId);
    const isAccountAlreadyConnected = user.accounts.find(
      acc => acc.id === accountId
    );

    if (isAccountAlreadyConnected) {
      logger.debug(
        `user-service: ${provider} account already connected, updating...`
      );
      return updateUser(
        { userId, 'accounts.email': email },
        {
          'accounts.$.keys': keys,
          profileImg,
          name: displayName
        }
      );
    }

    // check if the user is part of an organisation
    if (user.organisationId) {
      logger.debug(
        `user-service: user belongs to organisation ${
          user.organisationId
        }, checking if this account can join`
      );
      const organisation = await getOrganisationById(user.organisationId);
      const { allowed, reason } = canUserJoinOrganisation(email, organisation);
      if (!allowed) {
        logger.debug(
          `user-service: user cannot connect this account to this organisation ${
            user.organisationId
          }`
        );
        // TODO throw warning
        throw new ConnectAccountError('user cannot join organisation', {
          errKey: reason
        });
      }
      await addUserAccountToOrganisation({
        user,
        organisation,
        account: { id: accountId, email }
      });
    }

    // if not part of an org just add the account like normal
    logger.debug(`user-service: ${provider} account not connected, adding...`);
    const account = {
      id: accountId,
      provider,
      email,
      keys
    };
    const updatedUser = await addAccount(userId, account);
    addConnectAccountActivity(updatedUser, account);

    return updatedUser;
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
    // signup/login with password if the user should belong to org
    // add the id to them but don't add the email to the organisation
    // as the org should only be billed for connected accounts
    const organisation = await getOrganisationForUserEmail(inviteCode, email);
    if (!id) {
      const referredBy = await getReferrer(referralCode);
      user = await createUserFromPassword({
        name: displayName,
        email,
        password,
        referredBy: referredBy ? referredBy.id : null,
        organisationId: organisation ? organisation.id : null,
        loginProvider: 'password',
        token: v4(),
        accounts: []
      });
      if (referredBy) {
        await addReferralActivity({ user, referralUser: referredBy });
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

// when a user signs up or logs in check if they should be added
// to an organisation based on
// 1. with invite code we still want to check they are allowed to join that org
// 2. no invite code get the first org they match by being invited or matching domain
async function getOrganisationForUserEmail(inviteCode, email) {
  logger.debug(`user-service: getting organisation for user email`);

  let organisation;
  // no invite code
  if (inviteCode) {
    logger.debug(`user-service: getting by invite code ${inviteCode}`);
    organisation = await getOrganisationByInviteCode(inviteCode);
  } else {
    logger.debug(
      `user-service: no invite code, trying to get org by invite or domain`
    );
    organisation = await getOrganisationByInvitedEmailOrValidDomain(email);
  }

  if (!organisation) {
    logger.debug(
      `user-service: no organisation found, no further action required`
    );
    return null;
  }

  const { allowed, reason } = canUserJoinOrganisation(email, organisation);
  if (allowed) {
    logger.debug(
      `user-service: got organisation ${organisation.id}, user email is allowed`
    );
    return organisation;
  }
  logger.debug(
    `user-service: got organisation, user is not allowed - ${reason}`
  );
  return null;
}

async function addReferralActivity({ user, referralUser }) {
  try {
    // add sign up reward for this user
    addActivityForUser(user.id, 'signedUpFromReferral', {
      id: referralUser.id,
      email: referralUser.email
    });

    // add sign up rewards for other user
    const referrerActivity = await addActivityForUser(
      referralUser.id,
      'referralSignUp',
      {
        id: user.id,
        email: user.email
      }
    );
    addReferral(referralUser.id, {
      id: referralUser.id,
      email: referralUser.email,
      activityId: referrerActivity.id,
      reward: referrerActivity.reward.credits
    });
    // add the data to the user
    addReferralSignupToStats();
  } catch (err) {
    logger.error(
      `user-service: error adding referral activity for user ${
        user.id
      }, referral user ${referralUser.id}`
    );
    throw err;
  }
}

function addConnectAccountActivity(user, account) {
  const { id: userId, loginProvider, accounts } = user;
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
    id: account.id,
    provider: account.provider,
    email: account.email
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

export async function addPackageToUser(userId, { productId, credits, price }) {
  try {
    const user = await addPackage(userId, productId, credits);
    addActivityForUser(userId, 'packagePurchase', {
      id: productId,
      credits,
      price
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
  try {
    logger.info(`user-service: deactivating user account ${id}`);

    const {
      id,
      email,
      provider,
      keys,
      organisationId,
      organisationAdmin
    } = user;
    const { refreshToken } = keys;

    if (organisationAdmin) {
      throw new Error(
        'cannot deactivate account - user is an organisation admin'
      );
    }

    await Promise.all(
      user.accounts.map(async a => {
        removeUserAccount(user, a.email);
      })
    );

    if (organisationId) {
      await removeUserFromOrganisation({ email });
    }
    await revokeToken({ provider, refreshToken });
    await removeUser(id);
    removeNewsletterSubscriber(email);
    addUserAccountDeactivatedToStats();
  } catch (err) {
    logger.error(`user-service: error deactivating user account ${user.id}`);
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
  try {
    const { id: userId, accounts, organisationId } = user;

    const account = accounts.find(e => e.email === email);

    const { id: accountId, provider, keys } = account;
    const { refreshToken } = keys;

    await revokeToken({ provider, refreshToken });
    const updatedUser = await removeAccount(userId, { accountId, email });
    addActivityForUser(userId, 'removeAdditionalAccount', {
      id: accountId,
      provider
    });

    if (organisationId) {
      logger.debug(
        `user-service: removed user account belonging to an organisation ${organisationId}`
      );
      const organisation = await removeUserFromOrganisation({
        email: account.email
      });
      addActivityForUser(userId, 'removedFromOrganisation', {
        id: organisation.id,
        name: organisation.name,
        email: account.email
      });
    }

    return updatedUser;
  } catch (err) {
    logger.error(
      `user-service: failed to disconnect user account for user ${user.id}`
    );
  }
}

async function revokeToken({ provider, refreshToken }) {
  if (provider === 'google') {
    await revokeTokenFromGoogle(refreshToken);
  } else if (provider === 'outlook') {
    await revokeTokenFromOutlook(refreshToken);
  }
}

export async function authenticateUser({ email, password }) {
  try {
    const user = await authenticate({ email, password });
    if (user === null) {
      throw new AuthError('user not found or password incorrect', {
        errKey: 'not-found'
      });
    }
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
        const { credits } = milestone;
        logger.debug(
          `user-service: adding reward of ${credits} to user ${userId}`
        );
        activityData = {
          ...activityData,
          ...reward
        };

        // give the user the unsubs
        await incrementUserCredits(userId, credits);
        addRewardGivenToStats(credits);
      }

      await setUserMilestoneCompleted(userId, name);
    }

    // add the activity to the array
    const activity = await addActivity(userId, activityData);
    if (activity.notification) {
      sendToUser(userId, 'notifications', [activity]);
    }
    if (activity.reward) {
      sendToUser(userId, 'new-credits', activity.reward.credits);
    }
    return activity;
  } catch (err) {
    throw err;
  }
}

export function incrementUserCredits(id, credits) {
  return incrementCredits(id, credits);
}
export function decrementUserCredits(id, credits) {
  return incrementCredits(id, -credits);
}

function getReward({ userActivity, name, milestone, activityData }) {
  const { maxRedemptions, credits } = milestone;

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
      credits
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

export function updateUserAutoBuy(id, autoBuy) {
  addActivityForUser(id, 'updatedPackageAutoBuyPreference', {
    autoBuy
  });
  return updateUser(id, {
    'billing.autoBuy': autoBuy
  });
}

export async function inviteReferralUser(userId, email) {
  try {
    const user = await getUserById(userId);
    const milestone = await getMilestone('referralSignUp');
    sendReferralInviteMail({
      toAddress: email,
      referrer: user.email,
      referralCode: user.referralCode,
      reward: milestone.credits
    });
  } catch (err) {
    throw err;
  }
}

export async function handleUserForgotPassword({ hashedEmail }) {
  try {
    const user = await getUserByHashedEmail(hashedEmail);

    if (!user) {
      throw new AuthError('user not found or password incorrect', {
        errKey: 'not-found'
      });
    }
    // update user
    const resetCode = shortid.generate();
    await updateUser(user.id, {
      resetCode,
      resetCodeExpires: addHours(Date.now(), 2)
    });
    // send email
    sendForgotPasswordMail({ toAddress: user.email, resetCode });
    return true;
  } catch (err) {
    throw err;
  }
}

export async function resetUserPassword({ email, password, resetCode }) {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      throw new AuthError('user not found or password incorrect', {
        errKey: 'not-found'
      });
    }
    if (resetCode !== user.resetCode) {
      throw new AuthError('user password reset code invalid', {
        errKey: 'invalid-reset-code'
      });
    }
    if (Date.now() > user.resetCodeExpires) {
      throw new AuthError('user password reset code expired', {
        errKey: 'expired-reset-code'
      });
    }

    const updatedUser = await updatePassword(user.id, password);
    return updatedUser;
  } catch (err) {
    throw err;
  }
}
