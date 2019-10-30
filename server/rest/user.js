import {
  addToUserIgnoreList,
  addUserReminder,
  authenticationRequiresTwoFactor,
  connectImapAccount,
  createUserTotpToken,
  deactivateUserAccount,
  enableOrganisationForUser,
  getUserActivity,
  getUserById,
  getUserLoginProvider,
  getUserNotifications,
  getUserPayments,
  handleUserForgotPassword,
  removeFromUserIgnoreList,
  removeUserAccount,
  removeUserBillingCard,
  removeUserReminder,
  removeUserTotpToken,
  setUserLoginProviderToPassword,
  setUserMilestoneCompleted,
  updateImapAccount,
  updateUserActivityCompleted,
  updateUserAutoBuy,
  updateUserPassword,
  updateUserPreferences
} from '../services/user';
import { getReferralStats, inviteReferralUser } from '../services/referral';

import Joi from 'joi';
import QRCode from 'qrcode';
import { RestError } from '../utils/errors';
import auth from '../middleware/route-auth';
import { destroySession } from '../session';
import { get as getAudit } from '../services/audit';
import { internalOnly } from '../middleware/host-validation';
import logger from '../utils/logger';
import rateLimit from '../middleware/rate-limit';
import { setSessionProp } from '../session';
import totpAuth from '../middleware/totp-auth';

// import { validateBody } from '../middleware/validation';

// const patchPasswordParams = {
//   oldPassword: Joi.string()
//     .required()
//     .label('Current password is required'),
//   password: Joi.string()
//     .min(6)
//     .required()
//     .label('Password must be a minimum of 6 characters')
// };

const isBeta = process.env.NODE_ENV === 'beta';
const userProps = [
  'id',
  'email',
  'token',
  'beta',
  'unsubscriptions',
  'scans',
  'profileImg',
  'ignoredSenderList',
  'referredBy',
  'referralCode',
  'reminder',
  'preferences',
  'loginProvider',
  'lastUpdatedAt',
  'accounts',
  'billing',
  'milestones',
  'unreadNotifications',
  'organisationId',
  'organisationAdmin',
  'organisationActive',
  'features',
  'organisation',
  '__migratedFrom',
  'passwordLastUpdatedAt'
];

export default app => {
  app.get('/api/me', auth, async (req, res, next) => {
    const { id: userId, token } = req.user;
    try {
      const user = await getUserById(userId);
      const requiresTwoFactorAuth = await authenticationRequiresTwoFactor(user);
      let response = {
        ...Object.keys(user).reduce((u, key) => {
          if (userProps.includes(key) && user[key] !== null) {
            return { ...u, [key]: user[key] };
          }
          return u;
        }, {}),
        requiresTwoFactorAuth,
        token,
        features: user.features || [],
        creditsEarned: user.activity.reduce(
          (out, a) => out + (a.rewardCredits || 0),
          0
        )
      };
      if (isBeta) {
        response = {
          ...response,
          isBeta: true
        };
      }
      res.send(response);
    } catch (err) {
      next(
        new RestError('failed to get user', {
          userId,
          cause: err
        })
      );
    }
  });

  app.get('/api/me/unsubscriptions', auth, async (req, res, next) => {
    const { id: userId } = req.user;
    try {
      const { unsubscriptions } = await getUserById(userId);
      res.send(unsubscriptions);
    } catch (err) {
      next(
        new RestError('failed to get user unsubscriptions', {
          userId,
          cause: err
        })
      );
    }
  });

  app.get('/api/me/billing', auth, async (req, res, next) => {
    const { id: userId } = req.user;
    try {
      const payments = await getUserPayments(userId);
      res.send(payments);
    } catch (err) {
      next(
        new RestError('failed to get user payments', {
          userId,
          cause: err
        })
      );
    }
  });

  app.get('/api/me/activity', auth, async (req, res, next) => {
    const { id: userId } = req.user;
    try {
      const activity = await getUserActivity(userId);
      res.send(activity);
    } catch (err) {
      next(
        new RestError('failed to get user activity', {
          userId,
          cause: err
        })
      );
    }
  });

  app.get('/api/me/audit', auth, async (req, res, next) => {
    const { id: userId } = req.user;
    try {
      const logs = await getAudit(userId);
      if (!logs) {
        return res.send([]);
      }
      return res.send(logs);
    } catch (err) {
      next(
        new RestError('failed to get user audit logs', {
          userId,
          cause: err
        })
      );
    }
  });

  app.get('/api/me/notifications', auth, async (req, res, next) => {
    const { id: userId } = req.user;
    try {
      const notifications = await getUserNotifications(userId);
      res.send(notifications);
    } catch (err) {
      next(
        new RestError('failed to get user notifications', {
          userId,
          cause: err
        })
      );
    }
  });

  app.post('/api/me/invite', auth, async (req, res, next) => {
    const { id } = req.user;
    const { email } = req.body;

    try {
      inviteReferralUser(id, email);
      return res.status(202).send();
    } catch (err) {
      logger.error('user-rest: error inviting user');
      logger.error(err);
      next(
        new RestError('failed to send invite', {
          userId: id,
          cause: err
        })
      );
    }
  });

  app.patch('/api/me/ignore', auth, async (req, res, next) => {
    const { user, body } = req;
    const { id } = user;
    const { op, value } = body;
    let newUser = user;
    try {
      if (op === 'add') {
        newUser = await addToUserIgnoreList(id, value);
      } else if (op === 'remove') {
        newUser = await removeFromUserIgnoreList(id, value);
      } else {
        logger.error(`user-rest: ignore patch op not supported`);
      }
      res.send(newUser);
    } catch (err) {
      next(
        new RestError('failed to patch user ignore list', {
          userId: id,
          op,
          cause: err
        })
      );
    }
  });

  app.patch('/api/me/reminder', auth, async (req, res, next) => {
    const { user, body } = req;
    const { id } = user;
    const { op, value } = body;
    let newUser = user;
    try {
      if (op === 'add') {
        const { timeframe, recurring } = value;
        newUser = await addUserReminder(id, timeframe, recurring);
      } else if (op === 'remove') {
        newUser = await removeUserReminder(id);
      } else {
        logger.error(`user-rest: reminder patch op not supported`);
      }
      res.send(newUser);
    } catch (err) {
      next(
        new RestError('failed to patch user reminder list', {
          userId: id,
          op,
          cause: err
        })
      );
    }
  });

  app.patch('/api/me/preferences', auth, async (req, res, next) => {
    const { user, body } = req;
    const { id } = user;
    const { op, value: preferences } = body;
    let updatedUser = user;
    try {
      if (op === 'update') {
        updatedUser = await updateUserPreferences(id, preferences);
      } else {
        logger.error(`user-rest: preferences patch op not supported`);
      }
      res.send(updatedUser);
    } catch (err) {
      next(
        new RestError('failed to patch user preferences', {
          userId: id,
          op,
          cause: err
        })
      );
    }
  });

  app.patch('/api/me/milestones', auth, async (req, res, next) => {
    const { user, body } = req;
    const { id } = user;
    const { op, value: milestone } = body;
    let updatedUser = user;
    try {
      if (op === 'update') {
        updatedUser = await setUserMilestoneCompleted(id, milestone);
      } else {
        logger.error(`user-rest: milestones patch op not supported`);
      }
      res.send(updatedUser);
    } catch (err) {
      next(
        new RestError('failed to patch user milestones', {
          userId: id,
          op,
          cause: err
        })
      );
    }
  });

  app.patch('/api/me/activity', auth, async (req, res, next) => {
    const { user, body } = req;
    const { id } = user;
    const { op, value } = body;
    let updatedUser = user;
    try {
      if (op === 'add') {
        updatedUser = await updateUserActivityCompleted(id, value);
      } else {
        logger.error(`user-rest: activity patch op not supported`);
      }
      res.send(updatedUser);
    } catch (err) {
      next(
        new RestError('failed to patch user activites', {
          userId: id,
          op,
          cause: err
        })
      );
    }
  });

  app.patch('/api/me/billing', auth, async (req, res, next) => {
    const { user, body } = req;
    const { id } = user;
    const { op } = body;
    let updatedUser = user;
    try {
      if (op === 'remove-card') {
        updatedUser = await removeUserBillingCard(id);
      } else if (op === 'update-autobuy') {
        const { value: autoBuy } = body;
        updatedUser = await updateUserAutoBuy(id, autoBuy);
      } else {
        logger.error(`user-rest: billing patch op not supported`);
      }
      res.send(updatedUser);
    } catch (err) {
      next(
        new RestError('failed to patch user billing', {
          userId: id,
          op,
          cause: err
        })
      );
    }
  });

  app.patch(
    '/api/me/password',
    auth,
    // validateBody(patchPasswordParams, {
    //   passthrough: false // TODO switch to true and handle here
    // }),
    async (req, res, next) => {
      const { user, body } = req;
      const { id, email, masterKey } = user;
      const { op, value } = body;

      try {
        if (op === 'update') {
          const { oldPassword, password: newPassword } = value;
          const {
            user: updatedUser,
            masterKey: newMasterKey
          } = await updateUserPassword(
            { id, email, password: oldPassword, masterKey },
            newPassword
          );
          setSessionProp(req, 'passport.user.masterKey', newMasterKey);
          res.send(updatedUser);
        } else if (op === 'set-password-login') {
          const updatedUser = await setUserLoginProviderToPassword(id);
          req.logout();
          destroySession(req);
          res.send(updatedUser);
        } else {
          logger.error(`user-rest: password patch op not supported`);
          res.send(user);
        }
      } catch (err) {
        next(
          new RestError('failed to patch user password', {
            userId: id,
            op,
            cause: err,
            ...err.data
          })
        );
      }
    }
  );

  app.patch('/api/me', auth, async (req, res, next) => {
    const { user, body } = req;
    const { id: userId } = user;
    const { op, value } = body;
    let updatedUser = user;
    try {
      if (op === 'remove-account') {
        updatedUser = await removeUserAccount(userId, value);
      } else if (op === 'add-imap-account') {
        updatedUser = await connectImapAccount(
          userId,
          req.user.masterKey,
          value
        );
      } else if (op === 'update-imap-account') {
        updatedUser = await updateImapAccount(
          userId,
          req.user.masterKey,
          value
        );
      } else if (op === 'enable-team') {
        updatedUser = await enableOrganisationForUser(userId);
      } else {
        logger.error(`user-rest: user patch op not supported`);
      }
      res.send(updatedUser);
    } catch (err) {
      next(
        new RestError('failed to patch user', {
          userId,
          op,
          cause: err,
          ...err.data
        })
      );
    }
  });

  app.get('/api/me/referrals', auth, async (req, res, next) => {
    const { id: userId } = req.user;
    try {
      const stats = await getReferralStats(userId);
      res.send(stats);
    } catch (err) {
      next(
        new RestError('failed to get user referral info', {
          userId,
          cause: err
        })
      );
    }
  });

  app.delete('/api/me', auth, async (req, res, next) => {
    const { user } = req;
    const { id: userId } = user;
    try {
      await deactivateUserAccount(userId);
      req.logout();
      res.status(200).send({ success: true });
    } catch (err) {
      next(
        new RestError('failed to delete user', {
          userId: user.id,
          cause: err,
          ...err.data
        })
      );
    }
  });

  // public route, locked down to our domains
  app.get(
    '/api/user/:hashedEmail/provider',
    rateLimit,
    internalOnly,
    async (req, res, next) => {
      const { hashedEmail } = req.params;
      try {
        const strat = await getUserLoginProvider({ hashedEmail });
        if (!strat) {
          return res.status(404).send();
        }
        return res.send(strat);
      } catch (err) {
        next(
          new RestError('failed to get user login strategy', {
            hashedEmail,
            cause: err
          })
        );
      }
    }
  );

  // public route, locked down to our domains
  app.get(
    '/api/user/:hashedEmail/forgot',
    rateLimit,
    internalOnly,
    async (req, res, next) => {
      const { hashedEmail } = req.params;
      try {
        handleUserForgotPassword({ hashedEmail });
        return res.status(202).send();
      } catch (err) {
        next(
          new RestError('failed to handle forgot password', {
            hashedEmail,
            cause: err
          })
        );
      }
    }
  );

  app.get('/api/me/2fa/setup', auth, async (req, res, next) => {
    const { user } = req;
    try {
      const { otpauth_url, base32 } = await createUserTotpToken(user);
      QRCode.toDataURL(otpauth_url, (err, data_url) => {
        res.send({ qrData: data_url, base32 });
      });
    } catch (err) {
      next(
        new RestError('failed to setup 2fa for user', {
          userId: user.id,
          cause: err
        })
      );
    }
  });

  app.delete('/api/me/2fa', totpAuth, async (req, res, next) => {
    const { user } = req;
    try {
      await removeUserTotpToken(user);
      res.status(204).send();
    } catch (err) {
      next(
        new RestError('failed to remove 2fa for user', {
          userId: user.id,
          cause: err
        })
      );
    }
  });
};
