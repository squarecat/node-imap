import { createGift } from '../services/gifts';

export default app => {
  app.post('/api/gift/:productId', async (req, res) => {
    const { productId } = req.params;
    const { token, address, name } = req.body;
    try {
      const couponId = await createGift({
        productId,
        token,
        address,
        name
      });
      return res.send({
        status: 'success',
        coupon: couponId
      });
    } catch (err) {
      console.log('gifts-rest: error with payment');
      console.log(err);
      return res.status(500).send({
        status: 'failed',
        err: err.toString()
      });
    }
  });
};
