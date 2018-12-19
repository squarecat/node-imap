import {
  createPayment,
  getPaymentCoupon,
  updateCouponUses,
  createCustomer,
  updateCustomer
} from '../utils/stripe';
import { addPaidScanToUser, getUserById } from '../services/user';
import { addPaymentToStats, addGiftRedemptionToStats } from '../services/stats';
import { updateUser } from '../dao/user';

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

export function getProduct(id) {
  return products.find(p => p.value === id);
}

export async function getCoupon(coupon) {
  return getPaymentCoupon(coupon);
}

export async function updateCoupon(name) {
  const couponData = await getCoupon(name);
  const { metadata = {} } = couponData;
  if (metadata.gift) addGiftRedemptionToStats();
  return updateCouponUses(couponData);
}

export async function createPaymentForUser({
  token,
  user,
  productId,
  coupon,
  address,
  name
}) {
  let payment;
  const { id: userId } = user;
  let { customerId } = await getUserById(userId);
  const { price: amount, label } = getProduct(productId);
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
    if (customerId) {
      await updateCustomer({
        customerId: customerId,
        token,
        email: user.email,
        address,
        name
      });
    } else {
      const { id } = await createCustomer({
        token,
        email: user.email,
        address,
        name
      });
      customerId = id;
    }
    payment = await createPayment({
      customerId: customerId,
      amount: price,
      productLabel: label,
      coupon: couponObject && couponObject.valid ? coupon : null
    });

    await updateUser(userId, {
      customerId
    });

    addPaidScanToUser(userId, productId);
    addPaymentToStats({ price: price / 100 });
    if (couponObject) {
      updateCoupon(coupon);
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
