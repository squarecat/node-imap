import { createCustomer, createPayment, getPayment } from '../utils/mollie';
import { updateCustomerId } from './user';
import { getDiscount } from '../dao/coupons';

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

export async function createPaymentForUser({ user, productId, coupon }) {
  let payment;
  const { price: amount, label, value: productType } = products.find(
    p => p.value === productId
  );
  let discountPercentage = 1;
  if (coupon) {
    discountPercentage = await getDiscount(coupon);
  }
  if (user.customerId) {
    payment = await createPayment({
      amount: amount * discountPercentage,
      productLabel: label,
      productType,
      customerId: user.customerId,
      userId: user.id
    });
  } else {
    const { name, email } = user;
    const customer = await createCustomer({ name: name || email, email });
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
}

export async function fetchPayment(id) {
  return getPayment(id);
}
