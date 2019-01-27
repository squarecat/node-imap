import { createPayment, createCoupon, createCustomer } from '../utils/stripe';
import _times from 'lodash.times';

import { getProduct } from './payments';
import { addGiftPaymentToStats } from '../services/stats';
import { sendGiftCouponMail, sendGiftCouponMultiMail } from '../utils/email';

import logger from '../utils/logger';

export async function createGift({
  productId,
  token,
  address,
  name,
  quantity = 1
}) {
  const { price, label } = getProduct(productId);
  const { email } = token;
  try {
    const { id: customerId } = await createCustomer({
      token,
      email,
      address,
      name
    });

    const totalAmount = price * quantity;

    await createPayment({
      customerId: customerId,
      productPrice: price,
      productLabel: label,
      quantity,
      gift: true
    });

    addGiftPaymentToStats({ price: totalAmount / 100 }, quantity);
    if (quantity > 1) {
      const coupons = await Promise.all(
        _times(quantity, () => {
          return generateCoupon({
            price,
            purchaser: { name, email }
          });
        })
      );
      sendGiftCouponMultiMail({
        toAddress: email,
        scanPeriod: label,
        coupons,
        quantity
      });
      return coupons;
    } else {
      const couponId = await generateCoupon({
        price,
        purchaser: { name, email }
      });
      sendGiftCouponMail({
        toAddress: email,
        scanPeriod: label,
        coupon: couponId
      });
      return couponId;
    }
  } catch (err) {
    logger.error('gifts-service: failed to create payment for gift');
    logger.error(err);
    throw err;
  }
}

async function generateCoupon({ price, purchaser = {} }) {
  const { name, email } = purchaser;
  const { id: couponId } = await createCoupon({
    amount_off: price,
    metadata: { gift: true, name, email }
  });
  return couponId;
}
