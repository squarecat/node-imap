import {
  createPayment,
  getPaymentCoupon,
  updateCouponUses,
  createCustomer,
  updateCustomer,
  listInvoices
} from '../utils/stripe';
import { addPaidScanToUser, getUserById } from '../services/user';
import { updateReferralOnReferrer } from '../services/referral';
import { addPaymentToStats, addGiftRedemptionToStats } from '../services/stats';
import { updateUser } from '../dao/user';

import logger from '../utils/logger';

export const products = [
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
  try {
    const couponData = await getCoupon(name);
    const { metadata = {} } = couponData;
    if (metadata.gift) addGiftRedemptionToStats();
    return updateCouponUses(couponData);
  } catch (err) {
    logger.error(`payments-service: failed to update coupon ${name}`);
    logger.error(err);
    throw err;
  }
}

export async function createPaymentForUser({
  token,
  user,
  productId,
  coupon,
  address,
  name
}) {
  try {
    let payment;
    const { id: userId } = user;
    let { customerId, referredBy } = await getUserById(userId);
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
      address,
      customerId: customerId,
      productPrice: price,
      productLabel: label,
      coupon: couponObject && couponObject.valid ? coupon : null
    });

    await updateUser(userId, {
      customerId
    });

    updateReferralOnReferrer(referredBy, {
      userId: userId,
      scanType: label,
      price
    });
    addPaidScanToUser(userId, productId);
    addPaymentToStats({ price: price / 100 });
    if (couponObject) {
      updateCoupon(coupon);
    }

    return payment;
  } catch (err) {
    logger.error(
      `payments-service: failed to create payment for user ${
        user ? user.id : ''
      }`
    );
    logger.error(err);
    throw err;
  }
}

export async function listInvoicesForUser(userId) {
  try {
    const { customerId } = await getUserById(userId);
    if (!customerId) {
      logger.info(`payments-service: user has no customer ID ${userId}`);
      return [];
    }
    const response = await listInvoices(customerId);
    const { data, has_more } = response;
    const invoices = data.map(invoice => {
      const scan = invoice.lines.data[0];
      return {
        number: invoice.number,
        date: invoice.date,
        paid: invoice.paid,
        charge: invoice.charge,
        attempted: invoice.attempted,
        invoice_pdf: invoice.invoice_pdf,
        description: scan.description,
        price: scan.amount
      };
    });
    return {
      invoices,
      has_more
    };
  } catch (err) {
    logger.error(
      `payments-service: failed to list invoices for user ${userId}`
    );
    logger.error(err);
    throw err;
  }
}
