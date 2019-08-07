import { BillingModalContext, confirmIntent, getDisplayPrice } from './index';
import { FormCheckbox, FormGroup, FormNotification } from '../../form';
import {
  ModalBody,
  ModalCloseIcon,
  ModalHeader,
  ModalPaymentSaveAction
} from '..';
import React, { useContext } from 'react';

import PaymentAddressDetails from '../../payments/address-details';
import PaymentCardDetails from '../../payments/card-details';
import { StripeStateContext } from '../../../providers/stripe-provider';
import { TextImportant } from '../../text';
import { getPaymentError } from '../../../utils/errors';
import { injectStripe } from 'react-stripe-elements';
import request from '../../../utils/request';
import useUser from '../../../utils/hooks/use-user';

function NewBillingForm({ stripe, onPurchaseSuccess }) {
  const { state, dispatch } = useContext(BillingModalContext);
  const { state: stripeState } = useContext(StripeStateContext);
  const [email] = useUser(u => u.email);

  async function onSubmit() {
    try {
      dispatch({ type: 'set-loading', data: true });
      dispatch({ type: 'set-error', data: false });

      const billingDetails = {
        name: state.name,
        address: {
          line1: state.line1,
          line2: state.line2,
          city: state.city,
          country: state.country,
          postal_code: state.postal_code
        },
        email
      };

      const {
        paymentMethod,
        error: paymentError
      } = await stripe.createPaymentMethod('card', stripeState.cardRef, {
        billing_details: billingDetails
      });

      if (paymentError) {
        dispatch({
          type: 'set-error',
          data: paymentError.message
        });
      } else {
        const response = await confirmPayment({
          paymentMethod,
          productId: state.selectedPackage.id,
          coupon: state.coupon,
          saveCard: state.save_payment_method,
          ...billingDetails
        });
        await handleResponse(response);
      }
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
        data: message
      });
    } else {
      onPurchaseSuccess(response.user);
      dispatch({ type: 'set-step', data: 'success' });
    }
  }

  // TODO used elsewhere - make this common
  async function handleRequiresAction(response) {
    // Use Stripe.js to handle the required card action
    const { error: errorAction, paymentIntent } = await stripe.handleCardAction(
      response.payment_intent_client_secret,
      stripeState.cardRef,
      { save_payment_method: state.save_payment_method }
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
      id="payment-form"
      onSubmit={e => {
        e.preventDefault();
        return onSubmit();
      }}
      method="post"
    >
      <ModalBody loading={!stripeState.isReady} compact>
        <ModalHeader>
          Enter Payment Method
          <ModalCloseIcon />
        </ModalHeader>
        <p>
          Purchasing a package of{' '}
          <TextImportant>{state.selectedPackage.credits} credits</TextImportant>
          .
        </p>

        <PaymentAddressDetails
          addressDetails={state}
          loading={state.loading}
          onChange={(key, value) =>
            dispatch({
              type: 'set-billing-detail',
              data: { key, value }
            })
          }
        />

        <PaymentCardDetails loading={state.loading} />

        <FormGroup>
          <FormCheckbox
            onChange={() =>
              dispatch({
                type: 'set-billing-detail',
                data: {
                  key: 'save_payment_method',
                  value: !state.save_payment_method
                }
              })
            }
            checked={state.save_payment_method}
            label="Save payment method"
          />
        </FormGroup>

        {state.error ? (
          <FormGroup>
            <FormNotification error>{state.error}</FormNotification>
          </FormGroup>
        ) : null}
      </ModalBody>

      <ModalPaymentSaveAction
        isDisabled={state.loading || !stripeState.isReady}
        isLoading={state.loading}
        cancelText="Back"
        saveText={<span>Pay{getDisplayPrice(state.selectedPackage)}</span>}
        onCancel={() => dispatch({ type: 'set-step', data: 'start-purchase' })}
      />
    </form>
  );
}

export default injectStripe(NewBillingForm);

async function confirmPayment({
  paymentMethod,
  productId,
  coupon,
  name,
  address,
  saveCard
}) {
  const { id } = paymentMethod;
  let url;
  if (coupon) {
    url = `/api/payments/checkout/new/${productId}/${coupon}`;
  } else {
    url = `/api/payments/checkout/new/${productId}`;
  }
  return request(url, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ payment_method_id: id, name, address, saveCard })
  });
}
