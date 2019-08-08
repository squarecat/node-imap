import * as PaymentService from '../services/payments';

import { RestError } from '../utils/errors';
import { addRefundToStats } from '../services/stats';
import auth from '../middleware/route-auth';
import countries from '../utils/countries.json';
import logger from '../utils/logger';

export default app => {
  app.get('/api/payments/coupon/:coupon', auth, async (req, res, next) => {
    const { coupon } = req.params;
    try {
      const c = await PaymentService.getCoupon(coupon);
      res.send(c);
    } catch (err) {
      next(
        new RestError('failed to get coupon', {
          cause: err,
          ...err.data,
          statusCode: 400
        })
      );
    }
  });

  app.post(
    '/api/payments/checkout/new/:productId/:coupon?',
    auth,
    async (req, res, next) => {
      const { user } = req;
      const { productId, coupon } = req.params;
      const {
        payment_method_id,
        payment_intent_id,
        name,
        address,
        saveCard
      } = req.body;
      try {
        const response = await PaymentService.createPaymentForUser(
          {
            paymentMethodId: payment_method_id,
            paymentIntentId: payment_intent_id
          },
          { user, productId, coupon, name, address, saveCard }
        );
        return res.send(response);
      } catch (err) {
        next(
          new RestError('failed to create new card payment for user', {
            userId: user.id,
            cause: err,
            ...err.data,
            statusCode: 400
          })
        );
      }
    }
  );

  app.post(
    '/api/payments/checkout/:productId/:coupon?',
    auth,
    async (req, res, next) => {
      const { user } = req;
      const { productId, coupon } = req.params;
      try {
        const response = await PaymentService.createPaymentWithExistingCardForUser(
          { user, productId, coupon }
        );
        return res.send(response);
      } catch (err) {
        next(
          new RestError('failed to create existing card payment for user', {
            userId: user.id,
            cause: err,
            ...err.data,
            statusCode: 400
          })
        );
      }
    }
  );

  app.post(
    '/api/payments/claim/:productId/:coupon',
    auth,
    async (req, res, next) => {
      const { user } = req;
      const { productId, coupon } = req.params;
      try {
        const response = await PaymentService.claimCreditsWithCoupon({
          user,
          productId,
          coupon
        });
        return res.send(response);
      } catch (err) {
        next(
          new RestError('failed to claim credits', {
            userId: user.id,
            cause: err,
            ...err.data,
            statusCode: 400
          })
        );
      }
    }
  );

  app.post('/api/payments/subscription', auth, async (req, res, next) => {
    const { organisationId, token, name, address } = req.body;
    try {
      const subscription = await PaymentService.createSubscriptionForOrganisation(
        organisationId,
        { token, name, address }
      );
      res.send(subscription);
    } catch (err) {
      next(
        new RestError('failed to create new subscription', {
          organisationId,
          cause: err,
          ...err.data,
          statusCode: 400
        })
      );
    }
  });

  app.post(
    '/api/payments/subscription/confirm',
    auth,
    async (req, res, next) => {
      const { organisationId } = req.body;
      try {
        await PaymentService.confirmSubscriptionForOrganisation(organisationId);
        res.send({ success: true });
      } catch (err) {
        next(
          new RestError('failed to confirm subscription subscription', {
            organisationId,
            cause: err,
            ...err.data,
            statusCode: 400
          })
        );
      }
    }
  );

  // stripe webhooks
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

  app.post('/api/payments/subscriptions', async (req, res) => {
    res.sendStatus(200);

    try {
      logger.info('payments-rest: got subscriptions webhook');
      const { body } = req;
      const { type, data } = body;

      // this event will fire if an invoice is incomplete and then succeeds
      if (
        type === 'invoice.payment_succeeded' &&
        data.billing_reason === 'subscription_create'
      ) {
        const { object } = data;
        const { subscription: subscriptionId } = object;
        return PaymentService.handleSubscriptionCreated({ subscriptionId });
      }

      if (type === 'invoice.payment_succeeded') {
        const { object } = data;
        const { subscription: subscriptionId, amount } = object;
        return PaymentService.handleInvoicePaymentSuccess({
          subscriptionId,
          amount
        });
      }

      if (type === 'invoice.payment_failed') {
        const { object } = data;
        const { subscription: subscriptionId } = object;
        return PaymentService.handleInvoicePaymentFailed({ subscriptionId });
      }

      if (type === 'customer.subscription.deleted') {
        const { request, object } = data;
        const { subscription: subscriptionId } = object;
        return PaymentService.handleSubscriptionDeleted({
          subscriptionId,
          request
        });
      }
    } catch (err) {
      logger.error('payments-rest: error with invoice webhook');
      logger.error(err);
    }
  });

  app.get('/api/countries.json', (req, res) => res.send(countries));
};
