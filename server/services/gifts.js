import { createPayment, createCoupon } from '../utils/stripe';
import { getProduct } from './payments';
import { addPaymentToStats } from '../services/stats';
import { sendGiftCouponMail } from '../utils/email';

export async function createGift({ productId, token }) {
  const { price, label } = getProduct(productId);
  const { id: tokenId, email: purchaserEmail } = token;
  try {
    const payment = await createPayment({
      amount: price,
      productLabel: label,
      tokenId
    });
    if (payment.paid) {
      addPaymentToStats({ price: price / 100, gift: true });
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
    } else {
      return payment;
    }
  } catch (err) {
    console.error('gifts-service: failed to create payment for gift');
    console.error(err);
    throw err;
  }
}
