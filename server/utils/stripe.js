import Stripe from 'stripe';
import { payments } from 'getconfig';
import axios from 'axios';
import countries from './countries.json';

const stripe = Stripe(payments.secretKey);

export async function createPayment({
  productPrice,
  productLabel,
  quantity = 1,
  customerId,
  coupon,
  address,
  gift = false
}) {
  const { country } = address;
  try {
    let description;
    if (gift) {
      description = `Payment for ${quantity} ${productLabel} gift scan${
        quantity > 1 ? 's' : ''
      }`;
    } else {
      description = `Payment for ${productLabel} scan`;
    }
    const { vatRate, vatAmount } = await getTaxInfo({
      country,
      amount: productPrice
    });

    const newProductPrice = (productPrice - vatAmount).toFixed();

    // create invoice line item
    await stripe.invoiceItems.create({
      customer: customerId,
      quantity,
      unit_amount: newProductPrice,
      currency: 'usd',
      description
    });
    // invoice line item will automatically be
    // applied to this invoice
    const payment = await stripe.invoices.create({
      customer: customerId,
      billing: 'charge_automatically',
      auto_advance: true,
      tax_percent: vatRate,
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

function getCountryCode(country) {
  const countryEntry = countries.find(c => c.name === country);
  if (!countryEntry) {
    throw new Error(`Unknown country name ${country}`);
  }
  return countryEntry.code;
}
async function getTaxInfo({ amount, country }) {
  const countryCode = getCountryCode(country);
  if (countryCode === 'US') {
    return {
      vatRate: 0,
      vatAmount: 0
    };
  }
  try {
    const url = [
      'http://apilayer.net/api/price?',
      `access_key=${payments.vatKey}`,
      `amount=${amount}`,
      `country_code=${countryCode}`
    ].join('&');
    const response = await axios.get(url);
    const { vat_rate } = response.data;
    return {
      vatRate: vat_rate,
      vatAmount: amount - amount / (vat_rate / 100 + 1)
    };
  } catch (err) {
    console.error(err);
    return {
      vatRate: 0,
      vatAmount: 0
    };
  }
}
