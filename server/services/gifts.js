import _times from 'lodash.times';

import { createPayment, createCoupon } from '../utils/stripe';
import { getProduct } from './payments';
import { addGiftPaymentToStats } from '../services/stats';
import { sendGiftCouponMail, sendGiftCouponMultiMail } from '../utils/email';

export async function createGift({ productId, token, quantity = 1 }) {
  const { price, label } = getProduct(productId);
  const { id: tokenId, email: purchaserEmail } = token;
  try {
    const totalAmount = price * quantity;
    const payment = await createPayment({
      amount: totalAmount,
      productLabel: label,
      tokenId
    });
    if (payment.paid) {
      addGiftPaymentToStats({ price: price / 100 }, quantity);

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
    } else {
      return payment;
    }
  } catch (err) {
    console.error('gifts-service: failed to create payment for gift');
    console.error(err);
    throw err;
  }
}
