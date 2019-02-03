import auth from './auth';
import {
  getUserById,
  addFreeScan,
  addToUserIgnoreList,
  removeFromUserIgnoreList,
  addUserScanReminder,
  removeUserScanReminder,
  getReferralStats,
  deactivateUserAccount
} from '../services/user';

import logger from '../utils/logger';

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
        lastUpdatedAt
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
        lastPaidScan: paidScans.length
          ? paidScans[paidScans.length - 1].scanType
          : null,
        reminder,
        lastUpdatedAt
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
      const { scans } = await getUserById(req.user.id);
      res.send(scans.reverse());
    } catch (err) {
      logger.error(`user-rest: error getting user scans ${req.user.id}`);
      logger.error(err);
      res.status(500).send(err);
    }
  });

  app.put('/api/me/paidscans/:productId/:coupon?', auth, async (req, res) => {
    const { user } = req;
    const { productId, coupon } = req.params;
    try {
      await addFreeScan(user.id, productId, coupon);
      res.send();
    } catch (err) {
      logger.error(
        `user-rest: error adding scan to user with product ID ${productId}`
      );
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
};
