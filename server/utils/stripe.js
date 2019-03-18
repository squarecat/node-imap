import Stripe from 'stripe';
import axios from 'axios';
import countries from './countries.json';
import logger from './logger';
import _capitalize from 'lodash.capitalize';
import { payments } from 'getconfig';

const stripe = Stripe(payments.secretKey);

export async function createPayment({
  productPrice,
  productLabel,
  quantity = 1,
  customerId,
  coupon,
  gift = false,
  provider
}) {
  try {
    const description = getDescription({
      quantity,
      productLabel,
      provider,
      gift
    });
    const totalAmount = productPrice * quantity;

    const payment = await stripe.charges.create({
      customer: customerId,
      amount: totalAmount,
      description,
      currency: 'usd',
      metadata: {
        coupon
      }
    });

    logger.info('stripe: created charge');
    return payment;
  } catch (err) {
    logger.error('stripe: failed to create charge');
    logger.error(err);
    throw err;
  }
}

export async function createInvoice({
  productPrice,
  productLabel,
  quantity = 1,
  customerId,
  coupon,
  address,
  provider,
  gift = false
}) {
  const { country } = address;
  try {
    const description = getDescription({
      quantity,
      productLabel,
      provider,
      gift
    });
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
    logger.info('stripe: created invoice');
    return payment;
  } catch (err) {
    logger.error('stripe: failed to create invoice');
    logger.error(err);
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
    logger.error('stripe: failed to get coupon');
    logger.error(err);
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
    logger.error('stripe: failed to update coupon uses');
    logger.error(err);
    throw err;
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
    logger.error(err);
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
    logger.info(`stripe: created customer ${id}`);
    return { id };
  } catch (err) {
    logger.error('stripe: failed to create customer');
    logger.error(err);
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
    logger.info(`stripe: updated customer ${id}`);
    return { id };
  } catch (err) {
    logger.error('stripe: failed to update customer');
    logger.error(err);
    throw err;
  }
}

export async function listInvoices(customerId) {
  try {
    const invoices = await stripe.invoices.list({ customer: customerId });
    return invoices;
  } catch (err) {
    logger.error('stripe: failed to list invoices');
    logger.error(err);
    throw err;
  }
}

export async function listCharges(customerId) {
  try {
    return stripe.charges.list({ customer: customerId });
  } catch (err) {
    logger.error('stripe: failed to list charges');
    logger.error(err);
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
  if (!countryCode || countryCode === 'US') {
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
    logger.error(`stripe: failed to get tax info`);
    logger.error(err);
    return {
      vatRate: 0,
      vatAmount: 0
    };
  }
}

function getDescription({ quantity, productLabel, provider, gift }) {
  if (gift) {
    return `Payment for ${quantity} ${productLabel} gift scan${
      quantity > 1 ? 's' : ''
    }`;
  }
  return `Payment for ${productLabel} scan for ${_capitalize(provider)}`;
}
