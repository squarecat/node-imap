import * as PaymentService from '../services/payments';

import { addRefundToStats } from '../services/stats';
import auth from '../middleware/route-auth';
import countries from '../utils/countries.json';
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

  app.post('/api/checkout/new/:productId?/:coupon?', auth, async (req, res) => {
    const { productId, coupon } = req.params;
    const {
      payment_method_id,
      payment_intent_id,
      name,
      address,
      saveCard
    } = req.body;
    try {
      const response = await PaymentService.createNewPaymentForUser(
        {
          paymentMethodId: payment_method_id,
          paymentIntentId: payment_intent_id
        },
        { user: req.user, productId, coupon, name, address, saveCard }
      );
      return res.send(response);
    } catch (err) {
      logger.error('payments-rest: error creating new payment');
      logger.error(err);
      return res.status(500).send({
        success: false,
        err: err.toString(),
        error: err.message
      });
    }
  });

  app.post('/api/checkout/:productId?/:coupon?', auth, async (req, res) => {
    const { productId, coupon } = req.params;
    try {
      const response = await PaymentService.createPaymentWithExistingCardForUser(
        { user: req.user, productId, coupon }
      );
      return res.send(response);
    } catch (err) {
      logger.error('payments-rest: error creating new payment');
      logger.error(err);
      return res.status(500).send({
        success: false,
        err: err.toString(),
        error: err.message
      });
    }
  });

  // app.post('/api/checkout/:productId/:coupon?', auth, async (req, res) => {
  //   const { user, cookies } = req;
  //   const { productId, coupon } = req.params;
  //   const { token, address, name } = req.body;
  //   const { referrer } = cookies;
  //   try {
  //     await PaymentService.createPaymentForUser({
  //       user: user,
  //       productId,
  //       coupon,
  //       token,
  //       address,
  //       name,
  //       referrer
  //     });
  //     return res.send({
  //       status: 'success'
  //     });
  //   } catch (err) {
  //     logger.error('payments-rest: error with payment');
  //     logger.error(err);
  //     return res.status(500).send({
  //       status: 'failed',
  //       err: err.toString()
  //     });
  //   }
  // });

  app.post('/api/payments/refund', async (req, res) => {
    res.sendStatus(200);

    try {
      logger.info('payments-rest: got refund webhook');
      const { body } = req;
      const { type, data } = body;
      if (type === 'charge.refunded') {
        const { amount_refunded } = data;
        await addRefundToStats({ price: amount_refunded / 100 });
      }
    } catch (err) {
      logger.error('payments-rest: error with refund webhook');
      logger.error(err);
    }
  });

  app.get('/api/countries.json', (req, res) => res.send(countries));
};
