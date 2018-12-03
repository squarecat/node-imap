import { payments } from 'getconfig';
import Mollie from '@mollie/api-client';

const { apiKey, redirectUrl, webhookUrl } = payments;
const mollie = Mollie({ apiKey });

console.log(Object.keys(mollie));

export async function createPayment({
  amount,
  productLabel,
  productType,
  customerId,
  userId
}) {
  console.log(
    `making payment of ${amount} for product ${productLabel} by ${customerId}`
  );
  try {
    const payment = await mollie.payments.create({
      amount: {
        value: amount.toFixed(2),
        currency: 'USD'
      },
      description: `Payment for ${productLabel}`,
      redirectUrl: `${redirectUrl}/${userId}/${productType}`,
      webhookUrl,
      customerId
    });
    console.log(`got redirect url`);
    return {
      paymentUrl: payment.getPaymentUrl()
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function createCustomer({ name, email }) {
  const user = await mollie.customers.create({
    name,
    email
  });
  const { id } = user;
  return { id };
}
