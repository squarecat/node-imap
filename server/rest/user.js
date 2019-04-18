import {
  addToUserIgnoreList,
  addUserScanReminder,
  createUserTotpToken,
  deactivateUserAccount,
  getReferralStats,
  getUserById,
  getUserLoginProvider,
  getUserPayments,
  removeFromUserIgnoreList,
  removeUserAccount,
  removeUserScanReminder,
  updateUserPreferences,
  verifyUserTotpToken
} from '../services/user';

import QRCode from 'qrcode';
import _sortBy from 'lodash.sortby';
import auth from '../middleware/route-auth';
import { internalOnly } from '../middleware/host-validation';
import logger from '../utils/logger';
import rateLimit from '../middleware/rate-limit';

export default app => {
  app.get('/api/me', auth, async (req, res) => {
    try {
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
        accounts
      } = await getUserById(req.user.id);
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
        hasScanned: scans ? !!scans.length : false,
        lastScan: scans.length ? scans[scans.length - 1] : null,
        lastPaidScanType: paidScans.length
          ? paidScans[paidScans.length - 1].scanType
          : null,
        reminder,
        preferences,
        loginProvider,
        lastUpdatedAt,
        accounts: accounts || []
      });
    } catch (err) {
      logger.error(`user-rest: error getting user ${req.user.id}`);
      logger.error(err);
      res.status(500).send(err);
    }
  });

  app.get('/api/me/unsubscriptions', auth, async (req, res) => {
    try {
      const { unsubscriptions } = await getUserById(req.user.id);
      res.send(unsubscriptions);
    } catch (err) {
      logger.error(
        `user-rest: error getting user unsubscriptions ${req.user.id}`
      );
      logger.error(err);
      res.status(500).send(err);
    }
  });

  app.get('/api/me/scans', auth, async (req, res) => {
    try {
      const { scans, paidScans } = await getUserById(req.user.id);
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
      logger.error(`user-rest: error getting user scans ${req.user.id}`);
      logger.error(err);
      res.status(500).send(err);
    }
  });

  app.get('/api/me/billing', auth, async (req, res) => {
    const { user } = req;
    try {
      const payments = await getUserPayments(user.id);
      res.send(payments);
    } catch (err) {
      logger.error(`user-rest: error getting user payments ${req.user.id}`);
      logger.error(err);
      res.status(500).send(err);
    }
  });

  app.patch('/api/me/ignore', auth, async (req, res) => {
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
      logger.error(`user-rest: error patching user ignore ${id} with op ${op}`);
      logger.error(err);
      res.status(500).send(err);
    }
  });

  app.patch('/api/me/reminder', auth, async (req, res) => {
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
      logger.error(
        `user-rest: error patching user reminder ${id} with op ${op}`
      );
      logger.error(err);
      res.status(500).send(err);
    }
  });

  app.patch('/api/me', auth, async (req, res) => {
    const { user, body } = req;
    const { id } = user;
    const { op, value } = body;
    let updatedUser = user;
    try {
      if (op === 'preferences') {
        updatedUser = await updateUserPreferences(id, value);
      } else if (op === 'remove-account') {
        updatedUser = await removeUserAccount(user, value);
      } else {
        logger.error(`user-rest: user patch op not supported`);
      }
      res.send(updatedUser);
    } catch (err) {
      logger.error(`user-rest: error patching user ${id} with op ${op}`);
      logger.error(err);
      res.status(500).send(err);
    }
  });

  app.get('/api/me/referrals', auth, async (req, res) => {
    const { user } = req;
    try {
      const stats = await getReferralStats(user.id);
      res.send(stats);
    } catch (err) {
      logger.error(`user-rest: error getting user referral info ${user.id}`);
      logger.error(err);
      res.status(500).send(err);
    }
  });

  app.delete('/api/user/me', auth, async (req, res) => {
    const { user } = req;
    try {
      await deactivateUserAccount(user);
      req.logout();
      res.status(200).send();
    } catch (err) {
      logger.error(`user-rest: error removing user ${user.id}`);
      logger.error(err);
      res.status(500).send(err);
    }
  });

  // public route, locked down to our domains
  app.get(
    '/api/user/:hashedEmail/provider',
    rateLimit,
    internalOnly,
    async (req, res) => {
      const { hashedEmail } = req.params;
      try {
        const strat = await getUserLoginProvider({ email: hashedEmail });
        if (!strat) {
          return res.status(404).send();
        }
        return res.send(strat);
      } catch (err) {
        logger.error(
          `user-rest: error getting user login strat ${hashedEmail}`
        );
        logger.error(err);
        res.status(500).send(err);
      }
    }
  );

  app.get('/api/user/me/2fa/setup', async (req, res) => {
    const { user } = req;
    try {
      const otpauth_url = await createUserTotpToken(user);
      QRCode.toDataURL(otpauth_url, (err, data_url) => {
        res.send(data_url);
      });
    } catch (err) {
      logger.error(`user-rest: failed to setup 2fa for user ${user.id}`);
      logger.error(err);
      res.status(500).send(err);
    }
  });

  app.put('/api/user/me/2fa/verify', async (req, res) => {
    const { user, body } = req;
    const { token } = body;
    const verified = await verifyUserTotpToken(user, { token });
    res.send(verified);
  });
};
