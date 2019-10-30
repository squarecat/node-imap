import {
  handleInvoicePaymentFailed,
  handleInvoicePaymentSuccess,
  handleSubscriptionCreated,
  handleSubscriptionDeleted
} from '../../services/payments';

import { addRefundToStats } from '../../services/stats';
import logger from '../../utils/logger';
import { sendMessage } from '../../utils/telegram';

export default app => {
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
        return handleSubscriptionCreated({ subscriptionId });
      }

      if (type === 'invoice.payment_succeeded') {
        const { object } = data;
        const { subscription: subscriptionId, total } = object;
        return handleInvoicePaymentSuccess({
          subscriptionId,
          total
        });
      }

      if (type === 'invoice.payment_failed') {
        const { object } = data;
        const { subscription: subscriptionId } = object;
        return handleInvoicePaymentFailed({ subscriptionId });
      }

      if (type === 'customer.subscription.deleted') {
        const { request, object } = data;
        const { id: subscriptionId } = object;
        return handleSubscriptionDeleted({
          subscriptionId,
          request
        });
      }
    } catch (err) {
      logger.error('payments-rest: error with invoice webhook');
      logger.error(err);
    }
  });

  app.post('/api/payments', async (req, res) => {
    res.sendStatus(200);

    const { body } = req;
    const { type, data } = body;

    try {
      const { object } = data;
      const { amount, description, billing_details, receipt_email } = object;
      const email = billing_details.email || receipt_email;

      if (type === 'charge.succeeded') {
        sendMessage(
          `✅ New Payment! $${(amount / 100).toFixed(2)} from ${email}
${description}`
        );
      }

      if (type === 'charge.failed') {
        const { failure_code, failure_message } = object;
        sendMessage(
          `❌ Payment Failed - $${(amount / 100).toFixed(
            2
          )} from ${email} (${failure_code})
${failure_message}
  `
        );
      }

      if (type === 'charge.refunded') {
        const { amount_refunded } = object;
        sendMessage(
          `➖ Payment Refunded - $${(amount_refunded / 100).toFixed(
            2
          )} to ${email}
${description}
  `
        );
      }
    } catch (err) {
      logger.error(err);
    }
  });
};
