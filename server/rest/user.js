import {
  addToUserIgnoreList,
  addUserScanReminder,
  authenticationRequiresTwoFactor,
  createUserTotpToken,
  deactivateUserAccount,
  getReferralStats,
  getUserActivity,
  getUserById,
  getUserLoginProvider,
  getUserNotifications,
  getUserPayments,
  inviteReferralUser,
  removeFromUserIgnoreList,
  removeUserAccount,
  removeUserBillingCard,
  removeUserScanReminder,
  removeUserTotpToken,
  setUserMilestoneCompleted,
  updateUserAutoBuy,
  updateUserPassword,
  updateUserPreferences
} from '../services/user';

import Joi from 'joi';
import QRCode from 'qrcode';
import { RestError } from '../utils/errors';
import _sortBy from 'lodash.sortby';
import auth from '../middleware/route-auth';
import { internalOnly } from '../middleware/host-validation';
import logger from '../utils/logger';
import rateLimit from '../middleware/rate-limit';
import totpAuth from '../middleware/totp-auth';
import { validateBody } from '../middleware/validation';

const patchPasswordParams = {
  password: Joi.string()
    .min(6)
    .required()
    .label('Password must be a minimum of 6 characters'),
  ['password-confirm']: Joi.string()
    .valid(Joi.ref('password'))
    .label('Passwords must match')
};

export default app => {
  app.get('/api/me', auth, async (req, res, next) => {
    const { id: userId } = req.user;
    try {
      const user = await getUserById(userId);
      const {
        id,
        email,
        token,
        beta,
        unsubscriptions,
        scans,
        paidScans = [],
        profileImg,
        ignoredSenderList,
        referredBy,
        referralCode,
        reminder,
        preferences,
        loginProvider,
        lastUpdatedAt,
        accounts,
        billing,
        milestones = {},
        unreadNotifications = [],
        organisationId,
        organisationAdmin,
        organisationName,
        organisationActive
      } = user;

      const requiresTwoFactorAuth = await authenticationRequiresTwoFactor(user);
      res.send({
        id,
        email,
        token,
        beta,
        unsubscriptions,
        profileImg,
        ignoredSenderList,
        referredBy,
        referralCode,
        requiresTwoFactorAuth,
        hasScanned: scans ? !!scans.length : false,
        lastScan: scans.length ? scans[scans.length - 1] : null,
        lastPaidScanType: paidScans.length
          ? paidScans[paidScans.length - 1].scanType
          : null,
        reminder,
        preferences,
        loginProvider,
        lastUpdatedAt,
        accounts,
        billing,
        milestones,
        unreadNotifications,
        organisationId,
        organisationAdmin,
        organisationName,
        organisationActive
      });
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

  app.get('/api/me/scans', auth, async (req, res, next) => {
    const { id: userId } = req.user;
    try {
      const { scans, paidScans } = await getUserById(userId);
      const paidbyNotPerformed = paidScans
        .filter(s => !s.performed)
        .map(s => ({
          scannedAt: s.paidAt,
          totalPreviouslyUnsubscribedEmails: 0,
          totalEmails: 0,
          totalUnsubscribableEmails: 0,
          timeframe: s.scanType,
          performed: false
        }));
      const totalScans = _sortBy(
        [...paidbyNotPerformed, ...scans.map(s => ({ ...s, performed: true }))],
        'scannedAt'
      ).reverse();
      res.send(totalScans);
    } catch (err) {
      next(
        new RestError('failed to get user scans', {
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
      await inviteReferralUser(id, email);
      return res.send({ success: true });
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
    let newUser;
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
    const { op, value: timeframe } = body;
    let newUser = user;
    try {
      if (op === 'add') {
        newUser = await addUserScanReminder(id, timeframe);
      } else if (op === 'remove') {
        newUser = await removeUserScanReminder(id);
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
    validateBody(patchPasswordParams, {
      passthrough: true
    }),
    async (req, res) => {
      const { user, body } = req;
      const { id, email } = user;
      const { op, value } = body;

      let updatedUser = user;
      try {
        if (op === 'update') {
          const { oldPassword, password: newPassword } = value;
          await updateUserPassword(
            { id, email, password: oldPassword },
            newPassword
          );
          return res.send({ success: true });
        } else {
          logger.error(`user-rest: password patch op not supported`);
        }
        res.send(updatedUser);
      } catch (err) {
        return handleChangePasswordError(res, err);
      }
    }
  );

  app.patch('/api/me', auth, async (req, res, next) => {
    const { user, body } = req;
    const { id } = user;
    const { op, value } = body;
    let updatedUser = user;
    try {
      if (op === 'remove-account') {
        updatedUser = await removeUserAccount(user, value);
      } else {
        logger.error(`user-rest: user patch op not supported`);
      }
      res.send(updatedUser);
    } catch (err) {
      next(
        new RestError('failed to patch user', {
          userId: id,
          op,
          cause: err
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

  app.delete('/api/user/me', auth, async (req, res, next) => {
    const { user } = req;
    try {
      await deactivateUserAccount(user);
      req.logout();
      res.status(200).send({ success: true });
    } catch (err) {
      next(
        new RestError('failed to delete user', {
          userId: user.id,
          cause: err
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
        const strat = await getUserLoginProvider({ email: hashedEmail });
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

  app.get('/api/user/me/2fa/setup', auth, async (req, res, next) => {
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

  app.delete('/api/user/me/2fa', totpAuth, async (req, res, next) => {
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

function handleChangePasswordError(res, err) {
  let message = `Something went wrong. Please contact support.`;
  if (err.message === 'user not found or password incorrect') {
    message = `User not found or the password is incorrect`;
    logger.warn('user-rest: change password warning');
    logger.warn(err);
    return res.status(400).send({
      message,
      success: false
    });
  }
  logger.error(`user-rest: error patching user password`);
  logger.error(err);
  return res.status(500).send({ message, success: false });
}
