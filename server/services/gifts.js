import { createCoupon, createCustomer, createPayment } from '../utils/stripe';
import {
  sendGiftCouponMail,
  sendGiftCouponMultiMail
} from '../utils/emails/transactional';

import _times from 'lodash.times';
import { addGiftPaymentToStats } from '../services/stats';
import { getProduct } from './payments';
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

    const totalAmount = calculatePrice(price, quantity);

    await createPayment({
      address,
      customerId: customerId,
      productPrice: totalAmount,
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

function calculatePrice(price, quantity) {
  let discount = 0;
  if (quantity > 50) {
    discount = (price / 100) * 40;
  }
  if (quantity > 4 && quantity <= 50) {
    discount = (price / 100) * 25;
  }
  const discountedPrice = (price - discount) * quantity;
  return discountedPrice;
}

async function generateCoupon({ price, purchaser = {} }) {
  const { name, email } = purchaser;
  const { id: couponId } = await createCoupon({
    amount_off: price,
    metadata: { gift: true, name, email }
  });
  return couponId;
}
