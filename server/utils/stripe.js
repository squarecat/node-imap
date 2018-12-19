import Stripe from 'stripe';
import { payments } from 'getconfig';

const stripe = Stripe(payments.secretKey);

export async function createPayment({
  productPrice,
  productLabel,
  quantity = 1,
  customerId,
  coupon,
  gift = false
}) {
  try {
    let description;
    if (gift) {
      description = `Payment for ${quantity} ${productLabel} gift scan${
        quantity > 1 ? 's' : ''
      }`;
    } else {
      description = `Payment for ${productLabel} scan`;
    }
    // create invoice line item
    await stripe.invoiceItems.create({
      customer: customerId,
      quantity,
      unit_amount: productPrice,
      currency: 'usd',
      description
    });
    // invoice line item will automatically be
    // applied to this invoice
    const payment = await stripe.invoices.create({
      customer: customerId,
      billing: 'charge_automatically',
      auto_advance: true,
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
    console.error('stripe: failed to update coupon uses');
    console.error(err);
    throw err;
  }
}

export async function createCoupon({
  amount_off,
  duration = 'once',
  max_redemptions = 1,
  metadata = {}
}) {
  try {
    const name = generateCoupon();
    const coupon = await stripe.coupons.create({
      name: name,
      id: name,
      duration,
      amount_off,
      currency: 'usd',
      max_redemptions,
      metadata
    });
    return coupon;
  } catch (err) {
    console.error('stripe: failed to create coupon');
    console.error(err);
    throw err;
  }
}

function generateCoupon(length = 8) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase();
}

export async function createCustomer({ email, token, address, name }) {
  try {
    const customer = await stripe.customers.create({
      source: token.id,
      email,
      shipping: {
        address,
        name
      }
    });
    const { id } = customer;
    console.log('stripe: created customer', id);
    return { id };
  } catch (err) {
    console.error('stripe: failed to create customer');
    console.error(err);
    throw err;
  }
}

export async function updateCustomer({ token, customerId, address, name }) {
  try {
    const customer = await stripe.customers.update(customerId, {
      source: token.id,
      shipping: {
        address,
        name
      }
    });
    const { id } = customer;
    console.log('stripe: updated customer', id);
    return { id };
  } catch (err) {
    console.error('stripe: failed to update customer');
    console.error(err);
    throw err;
  }
}
