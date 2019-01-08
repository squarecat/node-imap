import auth from './auth';
import {
  getUserById,
  addFreeScan,
  addToUserIgnoreList,
  removeFromUserIgnoreList
} from '../services/user';

export default app => {
  app.get('/api/me', auth, async (req, res) => {
    const {
      id,
      email,
      token,
      beta,
      unsubscriptions,
      scans,
      profileImg,
      ignoredSenderList
    } = await getUserById(req.user.id);
    res.send({
      id,
      email,
      token,
      beta,
      unsubscriptions,
      profileImg,
      ignoredSenderList,
      hasScanned: scans ? !!scans.length : false
    });
  });

  app.get('/api/me/unsubscriptions', async (req, res) => {
    try {
      const { unsubscriptions } = await getUserById(req.user.id);
      res.send(unsubscriptions);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });

  app.get('/api/me/scans', async (req, res) => {
    try {
      const { scans } = await getUserById(req.user.id);
      res.send(scans.reverse());
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });

  app.put('/api/me/paidscans/:productId/:coupon?', auth, async (req, res) => {
    const { user } = req;
    const { productId, coupon } = req.params;
    try {
      await addFreeScan(user.id, productId, coupon);
      res.send();
    } catch (err) {
      console.log('user-rest: error adding scan to user', productId);
      console.log(err);
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
        console.error(`op not supported `);
      }
      res.send(newUser);
    } catch (err) {
      console.error(`user-rest: error patching user ${id} with op ${op}`);
    }
  });
};
