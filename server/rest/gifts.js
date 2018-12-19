import { createGift } from '../services/gifts';

export default app => {
  app.post('/api/gift/:productId', async (req, res) => {
    const { productId } = req.params;

    const { token, address, name, quantity } = req.body;
    try {
      const couponData = await createGift({
        productId,
        token,
        address,
        name,
        quantity
      });
      return res.send({
        status: 'success',
        couponData
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
