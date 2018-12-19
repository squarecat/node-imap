import { createPayment, createCoupon, createCustomer } from '../utils/stripe';
import _times from 'lodash.times';

import { getProduct } from './payments';
import { addGiftPaymentToStats } from '../services/stats';
import { sendGiftCouponMail, sendGiftCouponMultiMail } from '../utils/email';

export async function createGift({
  productId,
  token,
  address,
  name,
  quantity = 1
}) {
  const { price, label } = getProduct(productId);
  const { email: purchaserEmail } = token;
  try {
    const { id: customerId } = await createCustomer({
      token,
      email: purchaserEmail,
      address,
      name
    });

    const totalAmount = price * quantity;

    await createPayment({
      amount: totalAmount,
      customerId,
      productLabel: label
    });

    addGiftPaymentToStats({ price: totalAmount / 100 }, quantity);
    if (quantity > 1) {
      const coupons = await Promise.all(
        _times(quantity, async () => {
          const { id: couponId } = await createCoupon({
            amount_off: price,
            metadata: { gift: true }
          });
          return couponId;
        })
      );
      sendGiftCouponMultiMail({
        toAddress: purchaserEmail,
        scanPeriod: label,
        coupons,
        quantity
      });
      return coupons;
    } else {
      const { id: couponId } = await createCoupon({
        amount_off: price,
        metadata: { gift: true }
      });
      sendGiftCouponMail({
        toAddress: purchaserEmail,
        scanPeriod: label,
        coupon: couponId
      });
      return couponId;
    }
  } catch (err) {
    console.error('gifts-service: failed to create payment for gift');
    console.error(err);
    throw err;
  }
}
