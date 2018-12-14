import {
  createPayment,
  getPaymentCoupon,
  updateCouponUses
} from '../utils/stripe';
import { addPaidScanToUser } from '../services/user';
import { addPaymentToStats } from '../services/stats';

const products = [
  {
    price: 300,
    label: '1 week',
    value: '1w'
  },
  {
    price: 500,
    label: '1 month',
    value: '1m'
  },
  {
    price: 800,
    label: '6 months',
    value: '6m'
  }
];

export async function getCoupon(coupon) {
  return getPaymentCoupon(coupon);
}

export async function updateCoupon(coupon) {
  return updateCouponUses(coupon);
}

export async function createPaymentForUser({ token, user, productId, coupon }) {
  let payment;
  const { id: userId } = user;
  const { price: amount, label } = products.find(p => p.value === productId);
  const { id: tokenId } = token;
  let price = amount;
  let couponObject;
  if (coupon) {
    couponObject = await getCoupon(coupon);
    const { percent_off, amount_off } = couponObject;
    if (percent_off) {
      price = amount - amount * (percent_off / 100);
    } else if (amount_off) {
      price = amount - amount_off;
    }
  }
  try {
    payment = await createPayment({
      amount: price,
      productLabel: label,
      tokenId,
      coupon: couponObject && couponObject.valid ? coupon : null
    });
    if (payment.paid) {
      addPaidScanToUser(userId, productId);
      addPaymentToStats({ price: price / 100 });
      if (coupon) updateCoupon(coupon);
    }
    return payment;
  } catch (err) {
    console.error(
      'payments-service: failed to create payment for user',
      userId
    );
    console.error(err);
    throw err;
  }
}
