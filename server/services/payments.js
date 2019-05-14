import { addGiftRedemptionToStats, addPaymentToStats } from '../services/stats';
import {
  addPackageToUser,
  addPaidScanToUser,
  getUserById
} from '../services/user';
import {
  attachPaymentMethod,
  confirmPaymentIntent,
  createCustomer,
  createPayment,
  createPaymentIntent,
  detachPaymentMethod,
  generatePaymentResponse,
  getPaymentCoupon,
  getPaymentMethod,
  listCharges,
  listInvoices,
  updateCouponUses,
  updateCustomer
} from '../utils/stripe';

import _get from 'lodash.get';
import logger from '../utils/logger';
import { updateReferralOnReferrer } from '../services/referral';
import { updateUser } from '../dao/user';

// export const products = [
//   {
//     price: 300,
//     label: '1 week',
//     value: '1w'
//   },
//   {
//     price: 500,
//     label: '1 month',
//     value: '1m'
//   },
//   {
//     price: 800,
//     label: '6 months',
//     value: '6m'
//   }
// ];

// TODO this is duplicated from 'utils/prices'
// TODO put package data in the database?
const PACKAGE_DATA = [
  { id: '1', unsubscribes: 50, discount: 0.1 },
  { id: '2', unsubscribes: 100, discount: 0.15 },
  { id: '3', unsubscribes: 200, discount: 0.2 },
  { id: '4', unsubscribes: 300, discount: 0.4 }
];

const PACKAGE_BASE_PRICE = 10;

export const PACKAGES = PACKAGE_DATA.map(p => ({
  ...p,
  price: (PACKAGE_BASE_PRICE - PACKAGE_BASE_PRICE * p.discount) * p.unsubscribes
}));

// export function getProduct(id) {
//   return products.find(p => p.value === id);
// }

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

export function applyCoupon(amount, { percent_off = 0, amount_off = 0 }) {
  if (percent_off) {
    return amount - amount * (percent_off / 100);
  } else if (amount_off) {
    return amount - amount_off;
  }
}

// export async function createPaymentForUser({
//   token,
//   user,
//   productId,
//   coupon,
//   address,
//   name
// }) {
//   try {
//     let payment;
//     const { id: userId } = user;
//     let { customerId, referredBy } = await getUserById(userId);
//     const { price: amount, label } = getProduct(productId);
//     let price = amount;
//     let couponObject;
//     if (coupon) {
//       couponObject = await getCoupon(coupon);
//       price = applyCoupon(amount, couponObject);
//     }

//     if (price < 50 || process.env.NODE_ENV === 'beta') {
//       payment = true;
//     } else {
//       if (customerId) {
//         await updateCustomer({
//           customerId: customerId,
//           token,
//           email: user.email,
//           address,
//           name
//         });
//       } else {
//         const { id } = await createCustomer({
//           token,
//           email: user.email,
//           address,
//           name
//         });
//         customerId = id;
//       }
//       payment = await createPayment({
//         address,
//         customerId: customerId,
//         productPrice: price,
//         productLabel: label,
//         provider: user.provider,
//         coupon: couponObject && couponObject.valid ? coupon : null
//       });

//       await updateUser(userId, {
//         customerId
//       });

//       if (referredBy) {
//         updateReferralOnReferrer(referredBy, {
//           userId: userId,
//           scanType: label,
//           price
//         });
//       }
//       addPaymentToStats({ price: price / 100 });
//     }

//     addPaidScanToUser(userId, productId);
//     if (couponObject) {
//       updateCoupon(coupon);
//     }

//     return payment;
//   } catch (err) {
//     logger.error(
//       `payments-service: failed to create payment for user ${
//         user ? user.id : ''
//       }`
//     );
//     logger.error(err);
//     throw err;
//   }
// }

export async function listPaymentsForUser(userId) {
  try {
    const { customerId } = await getUserById(userId);
    if (!customerId) {
      logger.info(`payments-service: user has no customer ID ${userId}`);
      return [];
    }

    const [invoicesResponse, chargesResponse] = await Promise.all([
      listInvoices(customerId),
      listCharges(customerId)
    ]);

    let payments;
    let has_more;

    // user paid after we changed to charges from invoices
    if (!invoicesResponse.data.length && chargesResponse.data.length) {
      payments = chargesResponse.data.map(charge => {
        return {
          date: charge.created,
          paid: charge.paid,
          attempted: charge.paid,
          receipt_url: charge.receipt_url,
          refunded: !!charge.refunded,
          description: charge.description,
          price: charge.amount
        };
      });
      has_more = chargesResponse.has_more;
    } else {
      payments = invoicesResponse.data.map(invoice => {
        const scan = invoice.lines.data[0];
        const chargeData = invoice.charge
          ? chargesResponse.data.find(c => c.id === invoice.charge)
          : {};
        return {
          date: invoice.date,
          paid: invoice.paid,
          attempted: invoice.attempted,
          invoice_pdf: invoice.invoice_pdf,
          refunded: !!chargeData.refunded,
          description: scan.description,
          price: scan.amount
        };
      });
      has_more = invoicesResponse.has_more;
    }

    return {
      payments,
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

export async function createPaymentWithExistingCardForUser({
  user,
  productId,
  coupon
}) {
  try {
    let intent;

    const { customerId, paymentMethodId } = await getUserById(user.id);
    const { price: finalPrice, description } = await getPaymentDetails({
      productId,
      coupon
    });

    if (finalPrice < 50 || process.env.NODE_ENV === 'beta') {
      intent = {
        success: true
      };
    } else {
      intent = await createPaymentIntent(paymentMethodId, {
        amount: finalPrice,
        customerId,
        description,
        coupon
      });
    }

    const response = generatePaymentResponse(intent);
    if (response.success) {
      return handlePaymentSuccess(response, {
        user,
        productId,
        finalPrice: intent.amount,
        coupon: intent.metadata.coupon
      });
    }

    return response;
  } catch (err) {
    logger.error(
      `payments-service: failed to create payment for existing user card`
    );
    logger.error(err);
    throw err;
  }
}

async function getPaymentDetails({ productId, coupon }) {
  try {
    // get which product they are buying
    const { price: productPrice, unsubscribes } = PACKAGES.find(
      p => p.id === productId
    );
    const description = `Payment for ${unsubscribes} unsubscribes`;

    // calcualte any coupon discount
    let finalPrice = productPrice;
    let couponObject;
    if (coupon) {
      couponObject = await getCoupon(coupon);
      finalPrice = applyCoupon(productPrice, couponObject);
    }
    return { price: finalPrice, description };
  } catch (err) {
    logger.error(`payments-service: failed to get package payment details`);
    logger.error(err);
    throw err;
  }
}

async function getOrUpdateCustomerForUser(
  { paymentMethodId },
  { user, name, address, saveCard }
) {
  try {
    let {
      customerId,
      paymentMethodId: currentPaymentMethodId,
      email
    } = await getUserById(user.id);
    // create or update a stripe customer
    if (customerId) {
      await updateCustomer({
        customerId: customerId,
        name,
        address
      });
    } else {
      const { id } = await createCustomer({
        email,
        name,
        address
      });
      customerId = id;
    }

    let updates = { customerId };

    // remove the old card from stripe if there is one
    if (currentPaymentMethodId) {
      await detachPaymentMethod(currentPaymentMethodId);
      updates = {
        ...updates,
        paymentMethodId: null
      };
    }

    if (saveCard) {
      logger.debug('payments-service: saving user card');
      // add the new payment method and save to the user
      const paymentMethod = await attachPaymentMethod(
        paymentMethodId,
        customerId
      );
      const { card } = paymentMethod;
      const { last4, exp_month, exp_year } = card;
      updates = {
        ...updates,
        paymentMethodId,
        'billing.card': {
          last4,
          exp_month,
          exp_year
        }
      };
    }

    await updateUser(user.id, updates);
    return customerId;
  } catch (err) {
    logger.error(`payments-service: failed to get or update customer for user`);
    logger.error(err);
    throw err;
  }
}

async function handlePaymentSuccess(
  response,
  { user, productId, finalPrice, coupon }
) {
  try {
    logger.info(`payments-service: payment success for user ${user.id}`);

    const { unsubscribes } = PACKAGES.find(p => p.id === productId);
    logger.debug(
      `payments-service: adding package ${productId} to user - unsubs ${unsubscribes}`
    );
    const updatedUser = await addPackageToUser(
      user.id,
      productId,
      unsubscribes
    );

    addPaymentToStats({ price: finalPrice / 100 });
    // TODO add package purchase to stats

    if (coupon) {
      updateCoupon(coupon);
    }

    return {
      ...response,
      user: updatedUser
    };
  } catch (err) {
    logger.error(`payments-service: failed to handle payment success`);
    logger.error(err);
    throw err;
  }
}

export async function createNewPaymentForUser(
  { paymentMethodId, paymentIntentId },
  { user, productId, coupon, name, address, saveCard }
) {
  try {
    let intent;

    if (paymentMethodId) {
      const { price: finalPrice, description } = await getPaymentDetails({
        productId,
        coupon
      });

      // return success for beta users or amounts under 0.50c
      if (finalPrice < 50 || process.env.NODE_ENV === 'beta') {
        intent = {
          success: true
        };
      } else {
        const customerId = await getOrUpdateCustomerForUser(
          { paymentMethodId },
          { user, name, address, saveCard }
        );

        intent = await createPaymentIntent(paymentMethodId, {
          amount: finalPrice,
          customerId,
          description,
          coupon,
          saveCard
        });
      }
    } else if (paymentIntentId) {
      intent = await confirmPaymentIntent(paymentIntentId);
    }

    const response = generatePaymentResponse(intent);
    if (response.success) {
      return handlePaymentSuccess(response, {
        user,
        productId,
        finalPrice: intent.amount,
        coupon: intent.metadata.coupon
      });
    }
    return response;
  } catch (err) {
    logger.error('payments-service: failed to create new payment for  user');
    logger.error(err);
    throw err;
  }
}
