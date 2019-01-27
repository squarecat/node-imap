import auth from './auth';

import * as PaymentService from '../services/payments';

import logger from '../utils/logger';

export default app => {
  app.get('/api/checkout/:coupon', auth, async (req, res) => {
    const { coupon } = req.params;
    try {
      const c = await PaymentService.getCoupon(coupon);
      res.send(c);
    } catch (err) {
      logger.error('payments-rest: error with coupon');
      logger.error(err);
      return res.status(500).send({
        status: 'failed',
        err: err.toString()
      });
    }
  });

  app.post('/api/checkout/:productId/:coupon?', auth, async (req, res) => {
    const { user, cookies } = req;
    const { productId, coupon } = req.params;
    const { token, address, name } = req.body;
    const { referrer } = cookies;
    try {
      await PaymentService.createPaymentForUser({
        user: user,
        productId,
        coupon,
        token,
        address,
        name,
        referrer
      });
      return res.send({
        status: 'success'
      });
    } catch (err) {
      logger.error('payments-rest: error with payment');
      logger.error(err);
      return res.status(500).send({
        status: 'failed',
        err: err.toString()
      });
    }
  });
  app.post('/api/payments/hook', async (req, res) => {
    const { body } = req;
    const { type, data } = body;
    // if (type === 'invoice.finalized') {
    //   const { invoice_pdf, metadata } = data;
    //   const

    // }
    //invoice.payment_failed
    // invoice.payment_succeeded
    res.send('ok');
  });
};
