import auth from './auth';
import { getUserById, addPaidScanToUser } from '../services/user';

export default app => {
  app.get('/api/me', auth, async (req, res) => {
    const {
      id,
      email,
      token,
      beta,
      unsubscriptions,
      scans,
      profileImg
    } = await getUserById(req.user.id);
    res.send({
      id,
      email,
      token,
      beta,
      unsubscriptions,
      profileImg,
      hasScanned: scans ? !!scans.length : false
    });
  });

  app.put('/api/me/paidscans/:productId', auth, async (req, res) => {
    const { user } = req;
    const { productId } = req.params;
    try {
      await addPaidScanToUser(user.id, productId);
      res.send();
    } catch (err) {
      console.log('user-rest: error adding scan to user', productId);
      console.log(err);
      res.status(500).send(err);
    }
  });
};
