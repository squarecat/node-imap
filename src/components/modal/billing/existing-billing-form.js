import './billing-modal.module.scss';

import { BillingModalContext, confirmIntent, getDisplayPrice } from './index';
import { FormGroup, FormNotification } from '../../form';
import {
  ModalBody,
  ModalCloseIcon,
  ModalHeader,
  ModalPaymentSaveAction
} from '..';
import React, { useContext, useMemo } from 'react';

import CardDetails from '../../card-details';
import CouponForm from './coupon';
import Donate from './donate';
import { ModalContext } from '../../../providers/modal-provider';
import { getPaymentError } from '../../../utils/errors';
import { injectStripe } from 'react-stripe-elements';
import request from '../../../utils/request';

const ExistingForm = ({ stripe, billingCard, onPurchaseSuccess }) => {
  const { close: closeModal } = useContext(ModalContext);
  const { state, dispatch } = useContext(BillingModalContext);

  async function onSubmit() {
    try {
      dispatch({ type: 'set-loading', data: true });
      dispatch({ type: 'set-error', data: false });

      const response = await confirmPaymentExistingCard({
        productId: state.selectedPackage.id,
        coupon: state.coupon,
        donate: state.donate
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

  const displayPrice = useMemo(
    () => {
      const priceContent = getDisplayPrice(state.selectedPackage, state.donate);
      return <span>Pay{priceContent}</span>;
    },
    [state.selectedPackage, state.donate]
  );

  return (
    <>
      <ModalBody compact>
        <ModalHeader>
          Buy Package
          <ModalCloseIcon />
        </ModalHeader>
        <div styleName="payment-panels">
          <div styleName="panel">
            <h4>Use saved payment method</h4>

            <div styleName="card-preview">
              <CardDetails card={billingCard} />
            </div>

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

            <div styleName="existing-card-coupon">
              <CouponForm />
            </div>
          </div>

          <div styleName="panel panel-right">
            <Donate />
          </div>
        </div>

        {state.error ? (
          <div styleName="error">
            <FormGroup>
              <FormNotification error>{state.error}</FormNotification>
            </FormGroup>
          </div>
        ) : null}
      </ModalBody>

      <ModalPaymentSaveAction
        isDisabled={state.loading}
        isLoading={state.loading}
        cancelText="Cancel"
        saveText={displayPrice}
        onSave={onSubmit}
        onCancel={closeModal}
      />
    </>
  );
};

export default injectStripe(ExistingForm);

async function confirmPaymentExistingCard({ productId, coupon, donate }) {
  let url;
  if (coupon) {
    url = `/api/payments/checkout/${productId}/${coupon}`;
  } else {
    url = `/api/payments/checkout/${productId}`;
  }
  return request(url, {
    method: 'POST',

    body: JSON.stringify({
      donate
    })
  });
}
