import { AuthError, ConnectAccountError, UserError } from '../utils/errors';
import {
  addAccount,
  addActivity,
  addPackage,
  addPaidScan,
  addReminder,
  addTotpSecret,
  addUnsubscription,
  authenticate,
  createUser,
  createUserFromPassword,
  getLoginProvider,
  getTotpSecret,
  getUser,
  getUserByEmail,
  getUserByHashedEmail,
  getUserByReferralCode,
  incrementCredits,
  incrementCreditsUsed,
  removeAccount,
  removeBillingCard,
  removeReminder,
  removeTotpSecret,
  removeUser,
  resolveUnsubscription,
  setMilestoneCompleted,
  setNotificationsRead,
  updateIgnoreList,
  updatePassword,
  updateUnsubStatus,
  updateUnsubStatusById,
  updateUser,
  updateUserWithAccount,
  verifyEmail,
  verifyTotpSecret
} from '../dao/user';
import {
  addConnectedAccountToStats,
  addCreditsRewardedToStats,
  addNewsletterUnsubscriptionToStats,
  addReferralPurchaseToStats,
  addReminderRequestToStats,
  addUnsubStatusToStats,
  addUserAccountDeactivatedToStats,
  addUserToStats
} from './stats';
import {
  addUpdateSubscriber as addUpdateNewsletterSubscriber,
  removeSubscriber as removeNewsletterSubscriber
} from '../utils/emails/newsletter';
import {
  addUserToOrganisation,
  canUserJoinOrganisation,
  getOrganisationById,
  getOrganisationByInviteCode,
  getOrganisationByInvitedEmailOrValidDomain,
  removeUserAccountFromOrganisation
} from './organisation';
import { getMilestone, updateMilestoneCompletions } from './milestones';

import addHours from 'date-fns/add_hours';
import addMonths from 'date-fns/add_months';
import { addReferralToBothUsers } from './referral';
import addWeeks from 'date-fns/add_weeks';
import { detachPaymentMethod } from '../utils/stripe';
import { listPaymentsForUser } from './payments';
import logger from '../utils/logger';
import { revokeToken as revokeTokenFromGoogle } from '../utils/gmail';
import { revokeToken as revokeTokenFromOutlook } from '../utils/outlook';
import { sendForgotPasswordMail } from '../utils/emails/forgot-password';
import { sendToUser } from '../rest/socket';
// import { sendVerifyEmailMail } from '../utils/emails/verify-email';
import shortid from 'shortid';
import speakeasy from 'speakeasy';
import { updateOccurrenceHearted } from './occurrences';
import { v4 } from 'node-uuid';

export async function getUserById(id, options = {}) {
  try {
    let user = await getUser(id, {}, options);
    if (!user) return null;
    if (user.organisationId) {
      const {
        name,
        active,
        domain,
        inviteCode,
        allowAnyUserWithCompanyEmail
      } = await getOrganisationById(user.organisationId);
      user = {
        ...user,
        organisationActive: active,
        organisation: {
          id: user.organisationId,
          name,
          active,
          domain,
          inviteCode,
          allowAnyUserWithCompanyEmail
        }
      };
    }
    return user;
  } catch (err) {
    logger.error(`user-service: error getting user by id ${id}`);
    logger.error(err);
    throw err;
  }
}

export async function createOrUpdateUserFromOutlook(userData = {}, keys) {
  try {
    return createOrUpdateUser(userData, keys, 'outlook');
  } catch (err) {
    throw err;
  }
}

export async function createOrUpdateUserFromGoogle(userData = {}, keys) {
  try {
    return createOrUpdateUser(userData, keys, 'google');
  } catch (err) {
    throw err;
  }
}

async function validateUserAccountCreateUpdate({ id, email, provider }) {
  try {
    // we want to know if there is a user already which exists with this email
    // and login provider or has this account connected to their account
    //
    // existing account dinkydani@gmail.com
    // this user google auths dinkydani@gmail.com
    // strat will be password - so another account already exists
    //
    // existing account dinkydani@gmail.com has connected danielle@squarecat.io
    // this user google auths danielle@squarecat.io
    // strat will be 'connected-account' - so this account is already connected
    logger.debug(
      `user-service: validating user account create update for ${provider}`
    );

    const loginStrat = await getUserLoginProvider({ email });
    logger.debug(`user-service: loginStrat ${loginStrat}`);

    if (loginStrat === 'connected-account') {
      logger.debug(
        `user-service: cannot create/update user, already connected to a different account`
      );
      throw new AuthError(
        'user account already connected to a different account',
        {
          errKey: 'auth-account-error'
        }
      );
    }

    if (loginStrat === 'password') {
      logger.debug(
        `user-service: trying to connect an account which is used for password login... checking the user is allowed`
      );
      // a user trying to signup would have been prompted for their password
      // a user trying to connect an account we need to check they are connecting their own account
      const user = await getUserById(id);

      // if the user email is the same as the one connecting allow
      // otherwise it will be caught by existing with a different provider
      if (user && user.email === email) {
        logger.debug(
          `user-service: user connecting this account is the owner of the login account, allowing...`
        );
        return true;
      }
    }

    if (loginStrat && loginStrat !== provider) {
      logger.debug(
        `user-service: cannot create/update user, already exists with a different provider`
      );
      throw new AuthError('user already exists with a different provider', {
        errKey: 'auth-provider-error'
      });
    }

    return loginStrat;
  } catch (err) {
    throw err;
  }
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
    await validateUserAccountCreateUpdate({ id, email, provider });

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
      const referredBy = await getReferredByData(referralCode);
      const account = {
        id,
        provider,
        email,
        keys
      };
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
        account
      );
      if (referredBy) {
        await addReferralToBothUsers({ user, referredBy });
      }
      addUserToStats();
      addUpdateNewsletterSubscriber(email);
      addConnectAccountActivity(user, account);
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
      user = await updateUserWithAccount(
        { userId: id, accountEmail: email },
        updates,
        keys
      );
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
        return removeUserAccount(user.id, a.email);
      })
    );

    // add the email to the organisations users to be billed
    await addUserToOrganisation(organisation.id, {
      email: user.email
    });

    // add the joined and added acount activities
    addActivityForUser(user.id, 'joinedOrganisation', {
      id: organisation.id,
      name: organisation.name,
      email: user.email
    });
    addActivityForUser(user.id, 'addedAccountToOrganisation', {
      id: organisation.id,
      name: organisation.name,
      email: user.email
    });
  } catch (err) {
    throw err;
  }
}

async function addUserAccountToOrganisation({
  user,
  account,
  organisationId,
  organisationName
}) {
  try {
    logger.debug(
      `user-service: adding user account ${
        account.id
      } to organisation ${organisationId}`
    );

    await addUserToOrganisation(organisationId, {
      email: account.email
    });

    addActivityForUser(user.id, 'addedAccountToOrganisation', {
      id: organisationId,
      name: organisationName,
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

export function connectUserOutlookAccount(userId, accountData = {}, keys) {
  return connectUserAccount(userId, accountData, keys, 'outlook');
}

export function connectUserGoogleAccount(userId, accountData = {}, keys) {
  return connectUserAccount(userId, accountData, keys, 'google');
}

async function connectUserAccount(userId, accountData = {}, keys, provider) {
  const {
    id: accountId,
    email: accountEmail,
    profileImg,
    displayName
  } = accountData;
  try {
    logger.debug(`user-service: connecting user account - ${provider}`);

    await validateUserAccountCreateUpdate({
      id: userId,
      email: accountEmail,
      provider
    });

    const user = await getUser(userId);
    const isAccountAlreadyConnected = user.accounts.find(
      acc => acc.id === accountId
    );

    if (isAccountAlreadyConnected) {
      logger.debug(
        `user-service: ${provider} account already connected, updating...`
      );
      return updateUserWithAccount(
        { userId, accountEmail },
        {
          profileImg,
          name: displayName
        },
        keys
      );
    }

    // check if the user is part of an organisation
    if (user.organisationId) {
      logger.debug(
        `user-service: user belongs to organisation ${user.organisationId}`
      );
      const organisation = await getOrganisationById(user.organisationId);

      if (!user.organisationAdmin) {
        logger.debug(
          `user-service: user is not the organisation admin, checking if this account can join...`
        );

        const { allowed, reason } = canUserJoinOrganisation({
          email: accountEmail,
          organisation
        });
        if (!allowed) {
          logger.debug(
            `user-service: user cannot connect this account to this organisation ${
              user.organisationId
            }`
          );
          throw new ConnectAccountError('user cannot join organisation', {
            errKey: reason
          });
        }
      } else {
        logger.debug(
          `user-service: user is the organisation admin, allowing account to join`
        );
      }

      await addUserAccountToOrganisation({
        user,
        organisationId: user.organisationId,
        organisationName: organisation.name,
        account: { id: accountId, email: accountEmail }
      });
    }

    // if not part of an org just add the account like normal
    logger.debug(`user-service: ${provider} account not connected, adding...`);
    const account = {
      id: accountId,
      provider,
      email: accountEmail,
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
    let organisation;
    if (!id) {
      // new user account, check if they should be added to an org
      organisation = await getOrganisationForUserEmail(inviteCode, email);
      const referredBy = await getReferredByData(referralCode);
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
        await addReferralToBothUsers({ user, referredBy });
      }
      addUserToStats();
      addUpdateNewsletterSubscriber(email);
      // sendVerifyEmailMail({ toAddress: email, code: user.verificationCode });
    } else {
      let updates = {
        name: displayName
      };
      if (!user.organisationId) {
        logger.debug(
          `user-service: password user ${id} not a member of an organisation, checking if they should be...`
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
      user = await updateUser(id, updates);
    }

    // if user has joined an organisation add the joined activity
    // but do not add the email to the org current users
    // as only connected accounts count towards billed seats
    if (organisation) {
      addActivityForUser(user.id, 'joinedOrganisation', {
        id: organisation.id,
        name: organisation.name,
        email: user.email
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

async function getReferredByData(referralCode) {
  if (!referralCode) return null;
  const referrer = await getUserByReferralCode(referralCode);
  const { credits } = await getMilestone('signedUpFromReferral');
  return {
    id: referrer.id,
    email: referrer.email,
    reward: credits
  };
}

// when a user signs up or logs in check if they should be added
// to an organisation based on
// 1. with invite code we still want to check they are allowed to join that org
// 2. no invite code get the first org they match by being invited or matching domain
async function getOrganisationForUserEmail(inviteCode, email) {
  logger.debug(`user-service: getting organisation for user email`);

  let organisation;

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

  const { allowed, reason } = canUserJoinOrganisation({ email, organisation });
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

function addConnectAccountActivity(updatedUser, account) {
  const { id: userId, accounts } = updatedUser;

  // if only 1 account in the array then they connected their first account
  const activityName =
    accounts.length === 1
      ? 'connectedFirstAccount'
      : 'connectedAdditionalAccount';

  addActivityForUser(userId, activityName, {
    id: account.id,
    provider: account.provider,
    email: account.email
  });
  addConnectedAccountToStats(account.provider);
}

export async function updateUserAccountToken({ userId, accountEmail }, keys) {
  try {
    const user = await updateUserWithAccount(
      { userId, accountEmail },
      {},
      keys
    );
    // const user = await updateUser(id, {
    //   keys
    // });
    return user;
  } catch (err) {
    logger.error(
      `user-service: error updating user refresh token ${userId ||
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

// // TODO will be legacy
// export function addScanToUser(userId, scanData) {
//   return addScan(userId, scanData);
// }

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
    const user = await getUserById(userId);
    const { referredBy, billing = {} } = user;
    const { previousPackageId } = billing;

    if (referredBy && !previousPackageId) {
      // user purchasing first pacakge then record the stats
      // this user has purchased a package after being referred
      addActivityForUser(userId, 'purchaseFromReferral', {
        id: referredBy.id,
        email: referredBy.email,
        productId,
        credits,
        price
      });
      // add activity for the referral user too
      addActivityForUser(referredBy.id, 'referralPurchase', {
        id: user.id,
        email: user.email,
        productId,
        credits,
        price
      });
      addReferralPurchaseToStats();
    }

    const updatedUser = await addPackage(userId, productId, credits);
    addActivityForUser(userId, 'packagePurchase', {
      id: productId,
      credits,
      price
    });
    return updatedUser;
  } catch (err) {
    throw err;
  }
}

export async function addToUserIgnoreList(id, email) {
  try {
    await updateOccurrenceHearted(email, true);
    return updateIgnoreList(id, { action: 'add', value: email });
  } catch (err) {
    throw err;
  }
}
export async function removeFromUserIgnoreList(id, email) {
  try {
    await updateOccurrenceHearted(email, false);
    return updateIgnoreList(id, { action: 'remove', value: email });
  } catch (err) {
    throw err;
  }
}

export async function addUserReminder(id, timeframe) {
  try {
    const now = new Date();
    let remindAt = null;
    if (timeframe === '1w') {
      remindAt = addWeeks(now, 1);
    } else if (timeframe === '1m') {
      remindAt = addMonths(now, 1);
    } else if (timeframe === '3m') {
      remindAt = addMonths(now, 3);
    } else if (timeframe === '6m') {
      remindAt = addMonths(now, 6);
    }
    if (!remindAt) {
      throw new Error('invalid reminder timeframe');
    }
    addReminderRequestToStats();
    return addReminder(id, { timeframe, remindAt });
  } catch (err) {
    throw err;
  }
}

export function removeUserReminder(id) {
  return removeReminder(id);
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

export async function unsubscribeUserFromNewsletter(email, reason) {
  addNewsletterUnsubscriptionToStats();
  return updateUserMarketingConsent(email, false, reason);
}

export async function updateUserMarketingConsent(
  email,
  marketingConsent = true,
  reason = 'userPreference'
) {
  try {
    const user = await getUserByEmail(email);
    if (!user) return null;

    const { id } = user;

    return updateUserPreferences(id, {
      marketingConsent,
      unsubscribeReason: reason
    });
  } catch (err) {
    logger.error(`user-service: failed to update user prefs by email`);
    throw err;
  }
}

export async function deactivateUserAccount(userId) {
  try {
    const user = await getUserById(userId, { withAccountKeys: true });
    logger.info(`user-service: deactivating user account ${user.id}`);
    const { id, email, organisationId, organisationAdmin } = user;

    if (organisationAdmin) {
      logger.error(
        `user-service: cannot deactivate account, user is admin of organisation ${organisationId}`
      );
      throw new Error(
        'cannot deactivate account - user is an organisation admin'
      );
    }

    logger.debug(`user-service: removing user accounts...`);
    await Promise.all(
      user.accounts.map(async a => removeUserAccount(user.id, a.email))
    );

    logger.debug(`user-service: removing user ${id}...`);
    await removeUser(id);

    logger.debug(`user-service: removing newsletter subscriber...`);
    removeNewsletterSubscriber(email);
    addUserAccountDeactivatedToStats();

    logger.debug(`user-service: deactivating account - done`);
  } catch (err) {
    logger.error(`user-service: error deactivating user account`);
    throw err;
  }
}

export async function updateUserUnsubStatusById(
  unsubId,
  { status, message, ...data }
) {
  try {
    addUnsubStatusToStats(status);
    const { userId, mailId } = await updateUnsubStatusById(unsubId, {
      status,
      message,
      ...data
    });
    if (status === 'rejected' || status === 'failed') {
      incrementUserCredits(userId, 1);
    }
    const estimatedSuccess = status === 'delivered';
    sendToUser(userId, 'unsubscribe:success', {
      id: mailId,
      data: {
        estimatedSuccess,
        unsubStrategy: 'mailto',
        emailStatus: status,
        emailData: data
      }
    });
  } catch (err) {
    logger.error(
      `user-service: failed to update unsub status for user ${userId} and mail ${mailId}`
    );
    throw err;
  }
}
export async function updateUserUnsubStatus(
  userId,
  { mailId, status, message, ...data }
) {
  try {
    addUnsubStatusToStats(status);
    await updateUnsubStatus(userId, { mailId, status, message, ...data });
    if (status === 'rejected' || status === 'failed') {
      incrementUserCredits(userId, 1);
    }
    const estimatedSuccess = status === 'delivered';
    sendToUser(userId, 'unsubscribe:success', {
      id: mailId,
      data: {
        estimatedSuccess,
        unsubStrategy: 'mailto',
        emailStatus: status,
        emailData: data
      }
    });
  } catch (err) {
    logger.error(
      `user-service: failed to update unsub status for user ${userId} and mail ${mailId}`
    );
    throw err;
  }
}

export async function removeUserAccount(userId, accountEmail) {
  try {
    const user = await getUserById(userId, { withAccountKeys: true });
    const account = user.accounts.find(e => e.email === accountEmail);

    const { id: accountId, provider, keys } = account;
    const { refreshToken } = keys;

    await revokeToken({ provider, refreshToken });

    const updatedUser = await removeAccount(userId, {
      email: user.email,
      accountId,
      accountEmail
    });

    addActivityForUser(userId, 'removeAdditionalAccount', {
      id: accountId,
      provider,
      email: accountEmail
    });

    if (user.organisationId) {
      logger.debug(
        `user-service: removed user account belonging to an organisation ${
          user.organisationId
        }`
      );
      const organisation = await removeUserAccountFromOrganisation(
        user.organisationId,
        {
          email: accountEmail
        }
      );
      addActivityForUser(userId, 'removedAccountFromOrganisation', {
        id: organisation.id,
        name: organisation.name,
        email: accountEmail
      });
    }

    return updatedUser;
  } catch (err) {
    throw new Error('failed to disconnect user account', {
      userId: userId,
      cause: err
    });
  }
}

async function revokeToken({ provider, refreshToken }) {
  try {
    if (provider === 'google') {
      await revokeTokenFromGoogle(refreshToken);
    } else if (provider === 'outlook') {
      await revokeTokenFromOutlook(refreshToken);
    }
  } catch (err) {
    return true;
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

export async function getUserLoginProvider({ hashedEmail, email }) {
  try {
    return getLoginProvider({ hashedEmail, email });
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
    label: `LeaveMeAlone:${user.email}`
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

export async function updateUserActivityCompleted(userId, name) {
  try {
    // map frontend activity names to our ones to prevent users from adding them
    if (name === 'tweet') {
      return addActivityForUser(userId, 'sharedOnTwitter');
    }

    throw new UserError(`invalid activity`, {
      userId,
      errKey: 'invalid-activity'
    });
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
        activityData = {
          ...activityData,
          ...reward
        };
      }

      await setUserMilestoneCompleted(userId, name);
    }

    // add the activity to the array
    const activity = await addActivity(userId, activityData);

    if (activity.rewardCredits) {
      await incrementUserCredits(userId, activity.rewardCredits);
      addCreditsRewardedToStats(activity.rewardCredits);
      sendToUser(userId, 'update-credits', activity.rewardCredits);
    }
    if (typeof activity.notificationSeen !== 'undefined') {
      sendToUser(userId, 'notifications', [activity]);
    }

    return activity;
  } catch (err) {
    throw err;
  }
}

export function incrementUserCredits(id, credits) {
  logger.debug(`user-service: incrementing credits by ${credits}`);
  return incrementCredits(id, credits);
}

export function incrementCreditsUsedForUser(id, credits) {
  return incrementCreditsUsed(id, credits);
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
    rewardCredits: credits,
    notificationSeen: false
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
      // if seen is specified only return the ones which match this query
      if (typeof seen !== 'undefined') {
        return a.notificationSeen === seen;
      }
      // otherwise return them all
      return a.notificationSeen !== 'undefined';
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

export function verifyUserEmail(id) {
  return verifyEmail(id);
}
