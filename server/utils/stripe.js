import { PaymentError } from './errors';
import Stripe from 'stripe';
// import axios from 'axios';
// import countries from './countries.json';
import logger from './logger';
import { payments } from 'getconfig';

const stripe = Stripe(payments.secretKey);

export async function getPaymentCoupon(name) {
  try {
    const coupon = await stripe.coupons.retrieve(name);
    if (coupon) {
      const { valid, metadata = {}, max_redemptions } = coupon;
      const { uses = 0 } = metadata;
      const exceededRedemptions =
        parseInt(max_redemptions) > 0 &&
        parseInt(uses) >= parseInt(max_redemptions);
      if (valid && !exceededRedemptions) {
        return coupon;
      }
    }
    return { percent_off: 0, amount_off: 0, valid: false };
  } catch (err) {
    logger.error(`stripe: failed to get coupon: ${name}`);
    logError(err);
    return { percent_off: 0, amount_off: 0, valid: false };
  }
}

export async function updateCouponUses(coupon) {
  try {
    const { id, metadata } = coupon;
    const { uses = 0 } = metadata;
    const updated = await stripe.coupons.update(id, {
      metadata: {
        uses: parseInt(uses) + 1
      }
    });
    return updated;
  } catch (err) {
    logger.error(`stripe: failed to update coupon uses ${coupon}`);
    logError(err);
    return handleStripeError(err);
  }
}

export async function createCoupon({
  amount_off = 0,
  percent_off = 0,
  duration = 'once',
  max_redemptions = 1,
  metadata = {}
}) {
  try {
    const name = generateCoupon();
    let data = {
      name: name,
      id: name,
      duration,
      currency: 'usd',
      max_redemptions,
      metadata
    };
    if (amount_off) {
      data = { ...data, amount_off };
    } else if (percent_off) {
      data = { ...data, percent_off };
    }
    const coupon = await stripe.coupons.create(data);
    return coupon;
  } catch (err) {
    logger.error('stripe: failed to create coupon');
    logError(err);
    return handleStripeError(err);
  }
}

function generateCoupon(length = 8) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase();
}

export async function createCustomer({ email, ...data }) {
  try {
    const customer = await stripe.customers.create({
      email,
      ...data
    });
    const { id } = customer;
    logger.info(`stripe: created customer ${id}`);
    return { id };
  } catch (err) {
    logger.error('stripe: failed to create customer');
    logError(err);
    return handleStripeError(err);
  }
}

export async function updateCustomer({ customerId, ...data }) {
  try {
    const customer = await stripe.customers.update(customerId, {
      ...data
    });
    const { id } = customer;
    logger.info(`stripe: updated customer ${id}`);
    return { id };
  } catch (err) {
    logger.error('stripe: failed to update customer');
    logError(err);
    return handleStripeError(err);
  }
}

export async function listInvoices(customerId) {
  try {
    const invoices = await stripe.invoices.list({ customer: customerId });
    return invoices;
  } catch (err) {
    logger.error('stripe: failed to list invoices');
    logError(err);
    return handleStripeError(err);
  }
}

export async function listCharges(customerId) {
  try {
    return stripe.charges.list({ customer: customerId });
  } catch (err) {
    logger.error('stripe: failed to list charges');
    logError(err);
    return handleStripeError(err);
  }
}

// function getCountryCode(country) {
//   const countryEntry = countries.find(c => c.name === country);
//   if (!countryEntry) {
//     throw new Error(`Unknown country name ${country}`);
//   }
//   return countryEntry.code;
// }

// async function getTaxInfo({ amount, country }) {
//   const countryCode = getCountryCode(country);
//   if (!countryCode || countryCode === 'US') {
//     return {
//       vatRate: 0,
//       vatAmount: 0
//     };
//   }
//   try {
//     const url = [
//       'http://apilayer.net/api/price?',
//       `access_key=${payments.vatKey}`,
//       `amount=${amount}`,
//       `country_code=${countryCode}`
//     ].join('&');
//     const response = await axios.get(url);
//     const { vat_rate } = response.data;
//     return {
//       vatRate: vat_rate,
//       vatAmount: amount - amount / (vat_rate / 100 + 1)
//     };
//   } catch (err) {
//     logger.error(`stripe: failed to get tax info`);
//     logError(err);
//     return {
//       vatRate: 0,
//       vatAmount: 0
//     };
//   }
// }

// function getDescription({ quantity, productLabel, provider, gift }) {
//   if (gift) {
//     return `Payment for ${quantity} ${productLabel} gift scan${
//       quantity > 1 ? 's' : ''
//     }`;
//   }
//   return `Payment for ${productLabel} scan for ${_capitalize(provider)}`;
// }

export async function createPaymentIntent(
  paymentMethodId,
  { customerId, amount, description, coupon, saveCard, donateAmount = 0 }
) {
  logger.debug('stripe: creating payment intent');
  try {
    // Create the PaymentIntent
    const intent = await stripe.paymentIntents.create({
      payment_method: paymentMethodId,
      save_payment_method: saveCard,
      customer: customerId,
      amount,
      metadata: {
        coupon,
        donateAmount
      },
      description,
      currency: 'usd',
      confirmation_method: 'manual',
      confirm: true // attempt to confirm this PaymentIntent immediately
    });

    return intent;
  } catch (err) {
    logger.error(`stripe: failed to create payment intent`);
    logError(err);
    return handleStripeError(err);
  }
}

export async function confirmPaymentIntent(paymentIntentId) {
  try {
    const intent = await stripe.paymentIntents.confirm(paymentIntentId);
    return intent;
  } catch (err) {
    logger.error(`stripe: failed to confirm payment intent`);
    logError(err);
    return handleStripeError(err);
  }
}

export function getPaymentMethod(id) {
  return stripe.paymentMethods.retrieve(id);
}

export async function attachPaymentMethod(paymentMethodId, customerId) {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });
    return paymentMethod;
  } catch (err) {
    logger.error(`stripe: failed to attach payment method`);
    logError(err);
    return handleStripeError(err);
  }
}

export async function detachPaymentMethod(paymentMethodId) {
  try {
    await stripe.paymentMethods.detach(paymentMethodId);
  } catch (err) {
    logger.error(`stripe: failed to detach payment method`);
    logError(err);
    return true;
  }
}

export const generatePaymentResponse = intent => {
  logger.info(
    `stripe: generating payment response from intent - ${intent.status}`
  );

  if (
    intent.status === 'last_payment_error' ||
    intent.status === 'requires_payment_method'
  ) {
    // previously saved card is incorrect and we need new info
    return {
      requires_payment_method: true
    };
  }
  // requires_source_action renamed https://stripe.com/docs/upgrades#2019-02-11
  if (
    (intent.status === 'requires_source_action' ||
      intent.status === 'requires_action') &&
    intent.next_action.type === 'use_stripe_sdk'
  ) {
    // Tell the client to handle the action
    return {
      requires_action: true,
      payment_intent_client_secret: intent.client_secret
    };
  } else if (intent.status === 'succeeded') {
    // The payment didn’t need any additional actions and completed!
    // Handle post-payment fulfillment
    return {
      success: true
    };
  } else {
    // Invalid status
    return {
      error: 'Invalid PaymentIntent status'
    };
  }
};

// Multiple quantities of a plan are still billed using one invoice, and are prorated
// when the subscription changes, including when you change just the quantities involved
export async function createSubscription({
  customerId,
  planId,
  quantity = 1,
  coupon
}) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          plan: planId,
          quantity
        }
      ],
      // When creating the subscription, expand the latest_invoice.payment_intent field in order to
      // determine payment outcome using the invoice’s associated PaymentIntent.
      expand: ['latest_invoice.payment_intent'],
      enable_incomplete_payments: true,
      coupon
    });
    logger.info(`stripe: created subscription ${subscription.id}`);
    return subscription;
  } catch (err) {
    logger.error(`stripe: failed to create subscription`);
    logError(err);
    return handleStripeError(err);
  }
}

export async function updateSubscription({ subscriptionId, quantity }) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      quantity
    });
    logger.info(`stripe: updated subscription ${subscription.id}`);
    return subscription;
  } catch (err) {
    logger.error(`stripe: failed to update subscription`);
    logError(err);
    return handleStripeError(err);
  }
}

export async function payUpcomingInvoice({ customerId, subscriptionId }) {
  try {
    const { id: invoiceId } = await getUpcomingInvoice({
      customerId,
      subscriptionId
    });
    const invoice = await stripe.invoices.pay(invoiceId, {
      expand: ['payment_intent']
    });
    return invoice;
  } catch (err) {
    logger.error(`stripe: failed to update subscription`);
    logError(err);
    return handleStripeError(err);
  }
}

export async function getUpcomingInvoice({ customerId, subscriptionId }) {
  try {
    const invoice = await stripe.invoices.retrieveUpcoming({
      customer: customerId,
      subscription: subscriptionId
    });
    return invoice;
  } catch (err) {
    logger.error(`stripe: failed to update subscription`);
    logError(err);
    return handleStripeError(err);
  }
}

export async function getSubscription({ subscriptionId }) {
  try {
    return stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice']
    });
  } catch (err) {
    logger.error(`stripe: failed to fetch subscription`);
    logError(err);
    return handleStripeError(err);
  }
}

export async function listSubscriptions() {
  try {
    return stripe.subscriptions.list();
  } catch (err) {
    logger.error(`stripe: failed to list subscription`);
    logError(err);
    return handleStripeError(err);
  }
}

function handleStripeError(err) {
  switch (err.type) {
    case 'StripeCardError':
      // A declined card error
      // err.message; // => e.g. "Your card's expiration year is invalid."
      throw new PaymentError('Stripe card error', {
        errKey: {
          type: 'stripe-card-error',
          message: err.message
        }
      });
    case 'StripeRateLimitError':
      // Too many requests made to the API too quickly
      throw new PaymentError('Stripe rate limit error', err);
    case 'StripeInvalidRequestError':
      // Invalid parameters were supplied to Stripe's API
      throw new PaymentError('Stripe invalid request error', err);
    case 'StripeAPIError':
      // An error occurred internally with Stripe's API
      throw new PaymentError('Stripe API error', err);
    case 'StripeConnectionError':
      // Some kind of error occurred during the HTTPS communication
      throw new PaymentError('Stripe connection error', err);
    case 'StripeAuthenticationError':
      // You probably used an incorrect API key
      throw new PaymentError('Stripe authentication error', err);
    default:
      // Handle any other types of unexpected errors
      throw new PaymentError('Stripe unexpected error', err);
  }
}

function logError(err) {
  const { type, message } = err;
  if (type) logger.error(`stripe: error type - ${err.type}`);
  if (message) logger.error(`stripe: error message - ${err.message}`);
  if (!type || !message) {
    logger.error(err);
  }
}
