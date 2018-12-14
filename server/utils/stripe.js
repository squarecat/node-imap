import Stripe from 'stripe';
import { payments } from 'getconfig';

const stripe = Stripe(payments.secretKey);

export async function createPayment({ amount, productLabel, tokenId, coupon }) {
  try {
    const payment = await stripe.charges.create({
      amount: amount,
      currency: 'usd',
      source: tokenId,
      description: `Payment for ${productLabel}`,
      metadata: {
        coupon
      }
    });
    console.log('stripe: created charge');
    return payment;
  } catch (err) {
    console.error('stripe: failed to create charge');
    console.error(err);
    throw err;
  }
}

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
    console.error('stripe: failed to get coupon');
    return { percent_off: 0, amount_off: 0, valid: false };
  }
}

export async function updateCouponUses(name) {
  try {
    const coupon = await stripe.coupons.retrieve(name);
    const { id, metadata } = coupon;
    const { uses = 0 } = metadata;
    const updated = await stripe.coupons.update(id, {
      metadata: {
        uses: parseInt(uses) + 1
      }
    });
    return updated;
  } catch (err) {
    console.error('stripe: failed to update coupon uses');
    console.error(err);
    throw err;
  }
}

// NOT USED
export async function createCustomer({ email, token }) {
  try {
    const customer = await stripe.customers.create({
      source: token,
      email
    });
    const { id } = customer;
    console.log('stripe: created customer', id);
    return { id };
  } catch (err) {
    console.error('stripe: failed to create customer');
    console.error(err);

    switch (err.type) {
      case 'StripeCardError':
        // A declined card error
        err.message; // => e.g. "Your card's expiration year is invalid."
        break;
      case 'RateLimitError':
        // Too many requests made to the API too quickly
        break;
      case 'StripeInvalidRequestError':
        // Invalid parameters were supplied to Stripe's API
        break;
      case 'StripeAPIError':
        // An error occurred internally with Stripe's API
        break;
      case 'StripeConnectionError':
        // Some kind of error occurred during the HTTPS communication
        break;
      case 'StripeAuthenticationError':
        // You probably used an incorrect API key
        break;
      default:
        // Handle any other types of unexpected errors
        break;
    }
    throw err;
  }
}
