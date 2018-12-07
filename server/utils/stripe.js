import Stripe from 'stripe';
import { payments } from 'getconfig';

const stripe = Stripe(payments.secretKey);

export async function createPayment({ amount, productLabel, tokenId }) {
  try {
    debugger;
    const charge = await stripe.charges.create({
      amount: amount.toFixed(2),
      currency: 'usd',
      source: tokenId,
      description: `Payment for ${productLabel}`
    });
    console.log('stripe: created charge');
    console.log(charge);
    return true;
  } catch (err) {
    console.error('stripe: failed to create charge');
    console.error(err);
    throw err;
  }
}

export async function createCustomer({ email, token }) {
  try {
    debugger;
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
    throw err;
  }
}
