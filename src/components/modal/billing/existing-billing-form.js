import { BillingModalContext, confirmIntent, getDisplayPrice } from './index';
import { FormGroup, FormNotification } from '../../form';
import {
  ModalBody,
  ModalCloseIcon,
  ModalHeader,
  ModalPaymentSaveAction
} from '..';
import React, { useContext } from 'react';
// import { TextImportant, TextLink } from '../../text';

import CardDetails from '../../card-details';
import { injectStripe } from 'react-stripe-elements';
import request from '../../../utils/request';
import { getPaymentError } from '../../../utils/errors';

const ExistingForm = ({ stripe, billingCard, onPurchaseSuccess }) => {
  const { state, dispatch } = useContext(BillingModalContext);

  async function onSubmit() {
    try {
      dispatch({ type: 'set-loading', data: true });
      dispatch({ type: 'set-error', data: false });

      const response = await confirmPaymentExistingCard({
        productId: state.selectedPackage.id,
        coupon: state.coupon
      });
      await handleResponse(response);
    } catch (err) {
      const message = getPaymentError(err);
      dispatch({
        type: 'set-error',
        data: message
      });
    } finally {
      dispatch({ type: 'set-loading', data: false });
    }
  }

  // TODO used elsewhere - make this common
  async function handleResponse(response) {
    if (response.requires_action) {
      await handleRequiresAction(response);
    } else if (response.requires_payment_method) {
      const message = getPaymentError(response);
      dispatch({
        type: 'set-error',
        error: message
      });
      // dispatch({ type: 'set-step', data: 'enter-billing-details' });
    } else {
      onPurchaseSuccess(response.user);
      dispatch({ type: 'set-step', data: 'success' });
    }
  }

  // TODO used elsewhere - make this common
  async function handleRequiresAction(response) {
    // Use Stripe.js to handle the required card action
    const { error: errorAction, paymentIntent } = await stripe.handleCardAction(
      response.payment_intent_client_secret
    );

    if (errorAction) {
      // Show error from Stripe.js in payment form
      dispatch({ type: 'set-error', data: errorAction.message });
    } else {
      // The card action has been handled
      // The PaymentIntent can be confirmed again on the server
      const response = await confirmIntent({
        paymentIntent,
        productId: state.selectedPackage.id,
        coupon: state.coupon
      });
      handleResponse(response);
    }
  }

  return (
    <form
      id="existing-payment-form"
      onSubmit={e => {
        e.preventDefault();
        return onSubmit();
      }}
      method="post"
    >
      <ModalBody compact>
        <ModalHeader>
          Buy Package
          <ModalCloseIcon />
        </ModalHeader>
        <p>Confirm purchase with your saved payment method:</p>

        <FormGroup>
          <CardDetails card={billingCard} />
        </FormGroup>

        <p>
          Or{' '}
          <a
            onClick={() =>
              dispatch({ type: 'set-step', data: 'enter-billing-details' })
            }
          >
            use a different card
          </a>
          .
        </p>

        {state.error ? (
          <FormGroup>
            <FormNotification error>{state.error}</FormNotification>
          </FormGroup>
        ) : null}
      </ModalBody>

      <ModalPaymentSaveAction
        isDisabled={state.loading}
        isLoading={state.loading}
        cancelText="Back"
        saveText={<span>Pay{getDisplayPrice(state.selectedPackage)}</span>}
        onCancel={() => dispatch({ type: 'set-step', data: 'start-purchase' })}
      />
    </form>
  );
};

export default injectStripe(ExistingForm);

async function confirmPaymentExistingCard({ productId, coupon }) {
  let url;
  if (coupon) {
    url = `/api/payments/checkout/${productId}/${coupon}`;
  } else {
    url = `/api/payments/checkout/${productId}`;
  }
  return request(url, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}
