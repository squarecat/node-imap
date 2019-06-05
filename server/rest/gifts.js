import { RestError } from '../utils/errors';
import { createGift } from '../services/gifts';
import logger from '../utils/logger';

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
      return res.status(500).send({
        status: 'failed',
        err: new RestError('payment failed', {
          cause: err
        }).toJSON()
      });
    }
  });
};
