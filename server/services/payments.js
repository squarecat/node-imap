import { createCustomer, createPayment } from '../utils/stripe';
import { updateCustomerId } from './user';
// import { getDiscount } from '../dao/coupons';

const products = [
  {
    price: 3,
    label: '1 week',
    value: '1w'
  },
  {
    price: 5,
    label: '1 month',
    value: '1m'
  },
  {
    price: 8,
    label: '6 months',
    value: '6m'
  }
];

export async function createPaymentForUser({ token, user, productId, coupon }) {
  let payment;
  const { price: amount, label, value: productType } = products.find(
    p => p.value === productId
  );

  try {
    if (user.customerId) {
      payment = await createPayment({
        amount,
        productLabel: label,
        customerId: user.customerId
      });
    } else {
      const { email } = user;
      const customer = await createCustomer({ email, token });
      const { id: customerId } = customer;
      await updateCustomerId(user.id, customerId);
      // put customer id into database
      payment = await createPayment({
        amount,
        productLabel: label,
        customerId
      });
    }
    return payment;
  } catch (err) {
    console.error(
      'payments-service: failed to create payment for user',
      user.id
    );
    console.error(err);
    throw err;
  }
}
