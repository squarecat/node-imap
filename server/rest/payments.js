import * as PaymentService from '../services/payments';

import { addRefundToStats } from '../services/stats';
import auth from '../middleware/route-auth';
import countries from '../utils/countries.json';
import logger from '../utils/logger';

export default app => {
  app.get('/api/payments/coupon/:coupon', auth, async (req, res) => {
    const { coupon } = req.params;
    try {
      const c = await PaymentService.getCoupon(coupon);
      res.send(c);
    } catch (err) {
      logger.error('payments-rest: error with coupon');
      logger.error(err);
      return res.status(500).send({
        success: false,
        err: err.toString()
      });
    }
  });

  app.post(
    '/api/payments/checkout/new/:productId?/:coupon?',
    auth,
    async (req, res) => {
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
    }
  );

  app.post(
    '/api/payments/checkout/:productId?/:coupon?',
    auth,
    async (req, res) => {
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
    }
  );

  app.post('/api/payments/subscription', auth, async (req, res) => {
    const { organisationId, token, name, address, company } = req.body;
    try {
      const subscription = await PaymentService.createSubscriptionForOrganisation(
        organisationId,
        { token, name, address, company }
      );
      res.send(subscription);
    } catch (err) {
      logger.error('payments-rest: error creating new subscription');
      logger.error(err);
      return res.status(500).send({
        success: false,
        err: err.toString()
      });
    }
  });

  app.post('/api/payments/subscription/confirm', auth, async (req, res) => {
    const { organisationId } = req.body;
    try {
      await PaymentService.confirmSubscriptionForOrganisation(organisationId);
      res.send({ success: true });
    } catch (err) {
      logger.error('payments-rest: error confirming subscription');
      logger.error(err);
      return res.status(500).send({
        success: false,
        err: err.toString()
      });
    }
  });

  app.post('/api/payments/refund', async (req, res) => {
    res.sendStatus(200);

    try {
      logger.info('payments-rest: got refund webhook');
      const { body } = req;
      const { type, data } = body;
      if (type === 'charge.refunded') {
        let price = 0;
        const { object } = data;
        const { amount_refunded } = object;
        if (amount_refunded) {
          price = amount_refunded / 100;
        }
        logger.debug(`payments-rest: refund amount - ${price}`);
        return addRefundToStats({ price });
      }
    } catch (err) {
      logger.error('payments-rest: error with refund webhook');
      logger.error(err);
    }
  });

  app.post('/api/payments/invoice', async (req, res) => {
    res.sendStatus(200);

    try {
      logger.info('payments-rest: got invoice webhook');
      const { body } = req;
      const { type, data } = body;
      if (type === 'invoice.payment_succeeded') {
        return PaymentService.handleInvoicePaymentSuccess(data);
      }
    } catch (err) {
      logger.error('payments-rest: error with invoice webhook');
      logger.error(err);
    }
  });

  app.get('/api/countries.json', (req, res) => res.send(countries));
};
