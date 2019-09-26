import {
  claimCreditsWithCoupon,
  confirmSubscriptionForOrganisation,
  createPaymentForUser,
  createPaymentWithExistingCardForUser,
  createSubscriptionForOrganisation,
  getCoupon
} from '../services/payments';

import { RestError } from '../utils/errors';
import auth from '../middleware/route-auth';
import countries from '../utils/countries.json';

export default app => {
  app.get('/api/payments/coupon/:coupon', auth, async (req, res, next) => {
    const { coupon } = req.params;
    try {
      const c = await getCoupon(coupon);
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
        billingDetails,
        saveCard,
        donate
      } = req.body;
      try {
        const response = await createPaymentForUser(
          {
            paymentMethodId: payment_method_id,
            paymentIntentId: payment_intent_id
          },
          { user, productId, coupon, billingDetails, saveCard, donate }
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
      const { donate } = req.body;
      try {
        const response = await createPaymentWithExistingCardForUser({
          user,
          productId,
          coupon,
          donate
        });
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
        const response = await claimCreditsWithCoupon({
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
      const subscription = await createSubscriptionForOrganisation(
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
        await confirmSubscriptionForOrganisation(organisationId);
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

  app.get('/api/countries.json', (req, res) => res.send(countries));
};
