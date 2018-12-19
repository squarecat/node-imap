import { createPayment, createCoupon, createCustomer } from '../utils/stripe';
import { getProduct } from './payments';
import { addPaymentToStats } from '../services/stats';
import { sendGiftCouponMail } from '../utils/email';

export async function createGift({ productId, token, address, name }) {
  const { price, label } = getProduct(productId);
  const { email: purchaserEmail } = token;
  try {
    const { id: customerId } = await createCustomer({
      token,
      email: purchaserEmail,
      address,
      name
    });

    await createPayment({
      amount: price,
      customerId,
      productLabel: label
    });

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
  } catch (err) {
    console.error('gifts-service: failed to create payment for gift');
    console.error(err);
    throw err;
  }
}
