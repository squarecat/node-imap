import {
  addActivityForUser,
  addPackageToUser,
  getUserById
} from '../services/user';
import {
  addGiftRedemptionToStats,
  addPackageToStats,
  addPaymentToStats
} from '../services/stats';
import {
  attachPaymentMethod,
  confirmPaymentIntent,
  createCustomer,
  createPaymentIntent,
  createSubscription,
  detachPaymentMethod,
  generatePaymentResponse,
  getPaymentCoupon,
  getSubscription,
  listCharges,
  listInvoices,
  payUpcomingInvoice,
  updateCouponUses,
  updateCustomer
} from '../utils/stripe';
import {
  getOrganisationById,
  getOrganisationBySubscription,
  updateOrganisation
} from './organisation';

import { getPackage } from '../../shared/prices';
import logger from '../utils/logger';
import { payments } from 'getconfig';
import { sendToUser } from '../rest/socket';
import { updateUser } from '../dao/user';

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

export async function claimCreditsWithCoupon({ user, productId, coupon }) {
  try {
    logger.debug(`payments-service: claiming credits with coupon '${coupon}'`);
    const { price: productPrice, credits } = getPackage(productId);

    const couponObject = await getCoupon(coupon);
    const discountedPrice = applyCoupon(productPrice, couponObject);

    if (discountedPrice > 50) {
      logger.debug(
        `payments-service: failed to claim credits, applying coupon does not make package free`
      );
      return {
        success: false,
        error: {
          message: 'Cannot claim free package, payment is required',
          price: discountedPrice
        }
      };
    }

    logger.debug(
      `payments-service: claim successful, adding package ${productId} of ${credits} credits to user`
    );

    return handlePaymentSuccess(
      { success: true },
      {
        user,
        productId,
        finalPrice: 0,
        coupon
      }
    );
  } catch (err) {
    throw err;
  }
}

async function getPaymentDetails({ productId, coupon }) {
  try {
    // get which product they are buying
    const { price: productPrice, credits } = getPackage(productId);
    const description = `Payment for ${credits} credits`;

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
      addActivityForUser(user.id, 'addBillingCard');
    } else {
      updates = {
        ...updates,
        'billing.autoBuy': false
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

    const { credits } = getPackage(productId);
    logger.debug(
      `payments-service: adding package ${productId} to user - credits ${credits}`
    );
    const updatedUser = await addPackageToUser(user.id, {
      productId,
      credits,
      price: finalPrice
    });

    if (finalPrice > 50) {
      addPaymentToStats({ price: finalPrice / 100 });
      addPackageToStats({ credits });
    }

    if (coupon) {
      updateCoupon(coupon);
    }

    logger.debug(`payments-service: sending credits to socket ${credits}`);
    sendToUser(user.id, 'update-credits', credits);
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

export async function createPaymentForUser(
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
    logger.error(
      `payments-service: failed to create new payment for user ${user.id}`
    );
    logger.error(err);
    throw err;
  }
}

async function getOrUpdateCustomerForOrganisation(
  organisationId,
  { token, name, address, company }
) {
  try {
    let organisation = await getOrganisationById(organisationId);
    let { customerId, adminUserEmail } = organisation;

    if (customerId) {
      logger.debug(
        `payments-service: updating customer for org ${organisationId}`
      );
      await updateCustomer({
        customerId,
        source: token.id,
        name,
        address
      });
    } else {
      logger.debug(
        `payments-service: creating customer for org ${organisationId}`
      );
      const { id: newCustomerId } = await createCustomer({
        source: token.id,
        email: adminUserEmail,
        name,
        address
      });
      customerId = id;
      organisation = await updateOrganisation(organisationId, {
        customerId: newCustomerId
      });
      customerId = newCustomerId;
    }
    return { organisation, customerId };
  } catch (err) {
    logger.error(
      `payments-service: failed to get or update customer for organisation ${organisationId}`
    );
    logger.error(err);
    throw err;
  }
}

export async function createSubscriptionForOrganisation(
  organisationId,
  { token, name, address, company }
) {
  try {
    logger.info(
      `payments-service: creating subscription for org ${organisationId}`
    );

    const {
      organisation,
      customerId
    } = await getOrUpdateCustomerForOrganisation(organisationId, {
      token,
      name,
      address,
      company
    });
    logger.debug(`payments-service: created/updated customer ${customerId}`);

    const { billing = {} } = organisation;
    const { subscriptionStatus } = billing;

    // Subscription is incomplete if the initial payment attempt fails.
    // we are trying to create a subscription but the billing block will exist
    // with a subscriptionId already
    if (subscriptionStatus === 'incomplete') {
      logger.debug(
        `payments-service: subscription status is incomplete - retrying payment`
      );
      return retrySubscriptionPayment({
        organisationId,
        customerId,
        subscriptionId: billing.subscriptionId
      });
    }

    logger.debug(
      `payments-service: creating subscription for customer ${customerId}`
    );
    const planId = payments.plans.enterprise;
    const seats = organisation.currentUsers.length;
    const {
      id: subscriptionId,
      status,
      latest_invoice
    } = await createSubscription({
      customerId,
      planId,
      quantity: seats
    });

    logger.debug(`payments-service: updating organisation billing information`);

    // add the subscriptionId to lookup later incase of incomplete payment
    const { last4, exp_month, exp_year } = token.card;
    await updateOrganisation(organisationId, {
      'billing.subscriptionId': subscriptionId,
      'billing.subscriptionStatus': status,
      'billing.delinquent': false,
      'billing.company': company,
      'billing.card': {
        last4,
        exp_month,
        exp_year
      }
    });

    const response = generatePaymentResponse(latest_invoice.payment_intent);

    if (response.success) {
      logger.debug(`payments-service: payment success!`);
      return handleSubscriptionSuccess(response, {
        organisationId
      });
    }
    return response;
  } catch (err) {
    logger.error(
      `payments-service: failed to create new subscription for organisation ${organisationId}`
    );
    logger.error(err);
    throw err;
  }
}

export async function retrySubscriptionPayment({
  organisationId,
  customerId,
  subscriptionId
}) {
  try {
    logger.info(
      `payments-service: retrying payment for subscription for org ${organisationId}`
    );

    // try and pay the latest invoice
    const invoice = await payUpcomingInvoice({ customerId, subscriptionId });
    const response = generatePaymentResponse(invoice.payment_intent);
    if (response.success) {
      return handleSubscriptionSuccess(response, {
        organisationId
      });
    }
    return response;
  } catch (err) {
    logger.error(
      `payments-service: failed to retry subscription for organisation ${organisationId}`
    );
    logger.error(err);
    throw err;
  }
}

export async function confirmSubscriptionForOrganisation(organisationId) {
  try {
    const { billing = {} } = await getOrganisationById(organisationId);
    const { subscriptionId } = billing;
    if (!subscriptionId) {
      // TODO make this better but this shouldn't happen
      logger.error(
        `payments-service: cannot confirm subscription, organisation ${organisationId} has no subscription id`
      );
      return { success: false };
    }
    const subscription = await getSubscription({ subscriptionId });
    if (subscription.status !== 'active') {
      logger.error(
        `payments-service: cannot confirm subscription, subscription is not active`
      );
      return { success: false };
    }
    return handleSubscriptionSuccess({ success: true }, { organisationId });
  } catch (err) {
    throw err;
  }
}

async function handleSubscriptionSuccess(response, { organisationId }) {
  try {
    logger.debug(`payments-service: handling subscription success`);

    const organisation = await updateOrganisation(organisationId, {
      active: true,
      'billing.subscriptionStatus': 'active',
      'billing.delinquent': false
    });
    // add an activity?
    return {
      ...response,
      organisation
    };
  } catch (err) {
    logger.error(
      `payments-service: failed to handle subscription success for organisation ${organisationId}`
    );
    logger.error(err);
    throw err;
  }
}

export async function handleInvoicePaymentSuccess({ subscriptionId }) {
  try {
    logger.info(
      `payment-service: handling invoice payment success for subscription ${subscriptionId}`
    );

    const organisation = await getOrganisationBySubscription(subscriptionId);

    if (!organisation) {
      logger.warn(
        `payments-service: no organisation associated with subscription ${subscriptionId}`
      );
      return false;
    }

    // after 3D secure or additional SCA payment steps the user might navigate away
    // so this will ensure that the organisation is active after successful payment
    return updateOrganisation(organisation.id, {
      active: true,
      'billing.delinquent': false
    });
  } catch (err) {
    logger.error(
      `payments-service: failed to handle invoice payment success for subscription ${subscriptionId}`
    );
    logger.error(err);
    throw err;
  }
}

// When an automatic payment on a subscription fails, a charge.failed and an invoice.payment_failed event are sent, and the subscription state becomes past_due. Stripe attempts to recover payment according to your configured retry rules.

// After Stripe completes the configured recovery process, the subscription status remains past_due, or transitions to one of canceled or unpaid, depending upon your settings:
export async function handleInvoicePaymentFailed({ subscriptionId }) {
  try {
    // TODO do we need to handlet his or do we only need to know when the customer subscription was deleted?
    // after stripe has retried 3 times
    logger.info(
      `payment-service: handling invoice payment failed for subscription ${subscriptionId}`
    );

    const organisation = await getOrganisationBySubscription(subscriptionId);
    const { id: organisationId } = organisation;

    if (!organisation) {
      logger.warn(
        `payments-service: no organisation associated with subscription ${subscriptionId}`
      );
      return false;
    }

    const subscription = await getSubscription({ subscriptionId });

    if (!subscription) {
      // can this happen?
      // handle it just in case
      logger.warn(
        `payments-service: no subscription with id found ${subscriptionId}, setting org inactive`
      );

      await updateOrganisation(organisationId, {
        active: false,
        'billing.subscriptionStatus': 'canceled'
      });
    }

    const { status } = subscription;
    let updates = {
      'billing.subscriptionStatus': status
    };
    if (status === 'canceled' || status === 'unpaid') {
      logger.info(
        `payments-service: subscription ${subscriptionId} status ${status}, setting org inactive`
      );
      updates = {
        ...updates,
        active: false
      };
    }
    await updateOrganisation(organisationId, updates);
    return true;
  } catch (err) {
    logger.error(
      `payments-service: failed to handle invoice payment failed for subscription ${subscriptionId}`
    );
    logger.error(err);
    throw err;
  }
}

// When a subscription becomes canceled, the most recent unpaid invoice is closed, and no further invoices are generated.
// A customer.subscription.deleted event is triggered. (You can see that a subscription was canceled automatically—as opposed
// to by your request—if the customer.subscription.deleted event's request property is null.) Since the subscription has been
// deleted, it cannot be reactivated. Instead, collect updated billing details from your customer, update their default payment
// method in Stripe, and create a new subscription for their customer record.
export async function handleSubscriptionDeleted({ subscriptionId, request }) {
  try {
    logger.info(
      `payment-service: handling invoice payment failed for subscription ${subscriptionId}`
    );

    const organisation = await getOrganisationBySubscription(subscriptionId);
    const { id: organisationId } = organisation;

    if (!organisation) {
      logger.warn(
        `payments-service: no organisation associated with subscription ${subscriptionId}`
      );
      return false;
    }

    // a deleted subscription cannot be re-activated
    // 1. collect updated billing details from your customer - customer will change payment method from the org screen
    // 2. update their default payment method in Stripe - customerID is still valid so will update card
    // 3. create a new subscription for their customer record - there will be no subscription ID so will create one
    await updateOrganisation(organisationId, {
      active: false,
      'billing.subscriptionStatus': 'canceled',
      'billing.subscriptionId': null,
      // if the request property is null it was cancelled automatically
      'billing.delinquent': request === null
    });
    return true;
  } catch (err) {
    logger.error(
      `payments-service: failed to handle subscription deleted for subscription ${subscriptionId}`
    );
    logger.error(err);
    throw err;
  }
}

export async function updateBillingForOrganisation(
  id,
  { token, name, address, company }
) {
  try {
    logger.debug(`payment-service: updating billing for organisation ${id}`);
    // this will update as the organisation should have a customerID
    await getOrUpdateCustomerForOrganisation(id, {
      token,
      name,
      address,
      company
    });
    // set the new card details
    const { last4, exp_month, exp_year } = token.card;
    await updateOrganisation(id, {
      'billing.company': company,
      'billing.card': {
        last4,
        exp_month,
        exp_year
      }
    });
    // return a response that would be the same as intent etc
    return {
      success: true
    };
  } catch (err) {
    throw err;
  }
}
