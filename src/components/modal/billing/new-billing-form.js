import '../modal.module.scss';

import { BillingModalContext, confirmIntent, getDisplayPrice } from './index';
import { StripeStateContext } from '../../../providers/stripe-provider';
import { injectStripe } from 'react-stripe-elements';
import { FormCheckbox, FormGroup, FormNotification } from '../../form';
import { LockIcon } from '../../icons';
import React, { useContext } from 'react';

import Button from '../../btn';
import CouponInput from './coupon';
import { TextImportant } from '../../text';
import request from '../../../utils/request';
import useUser from '../../../utils/hooks/use-user';
import PaymentCardDetails from '../../payments/card-details';
import PaymentAddressDetails from '../../payments/address-details';

const DEFAULT_ERROR = 'Something went wrong, try again or contact support';

function CheckoutForm({ stripe, onPurchaseSuccess }) {
  const { state, dispatch } = useContext(BillingModalContext);
  const { state: stripeState } = useContext(StripeStateContext);

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
        }
      };

      const {
        paymentMethod,
        error: paymentError
      } = await stripe.createPaymentMethod(
        'card',
        // TODO get the element a better way
        // this does not accept a ref, or .current or findDOMNode...
        stripeState.cardRef.current._element,
        {
          billing_details: billingDetails
        }
      );

      if (paymentError) {
        console.error(paymentError);
        dispatch({ type: 'set-error', data: paymentError });
      } else {
        const response = await confirmPayment({
          paymentMethod,
          productId: state.selectedPackage.id,
          coupon: state.coupon,
          saveCard: state.save_payment_method,
          ...billingDetails
        });
        handleConfirmPaymentResponse(response);
      }
    } catch (err) {
      dispatch({
        type: 'set-error',
        data: DEFAULT_ERROR
      });
    } finally {
      dispatch({ type: 'set-loading', data: false });
    }
  }

  async function handleConfirmPaymentResponse(response) {
    if (response.error) {
      let message = DEFAULT_ERROR;
      if (response.error.message) {
        message = response.error.message;
      }
      dispatch({ type: 'set-error', error: message });
    } else if (response.requires_action) {
      dispatch({ type: 'set-loading', loading: true });
      await handleRequiresAction();
      dispatch({ type: 'set-loading', loading: false });
    } else {
      onPurchaseSuccess(response.user);
      dispatch({ type: 'set-step', data: 'success' });
    }
  }

  async function handleRequiresAction(response) {
    // Use Stripe.js to handle the required card action
    const { error: errorAction, paymentIntent } = await stripe.handleCardAction(
      response.payment_intent_client_secret,
      stripeState.cardRef,
      { save_payment_method: state.save_payment_method }
    );

    if (errorAction) {
      // Show error from Stripe.js in payment form
      dispatch({ type: 'set-error', error: errorAction });
    } else {
      // The card action has been handled
      // The PaymentIntent can be confirmed again on the server
      const response = await confirmIntent({
        paymentIntent,
        productId: state.selectedPackage.id,
        coupon: state.coupon
      });
      handleConfirmPaymentResponse(response);
    }
  }

  return (
    <>
      <div styleName="modal-content">
        <p>
          Purchasing a package of{' '}
          <TextImportant>
            {state.selectedPackage.unsubscribes} unsubscribes
          </TextImportant>
          .
        </p>
        <form
          id="payment-form"
          onSubmit={e => {
            e.preventDefault();
            return onSubmit();
          }}
          method="post"
        >
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

          <PaymentCardDetails />

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
              <FormNotification error>
                {state.error.message || DEFAULT_ERROR}
              </FormNotification>
            </FormGroup>
          ) : null}
        </form>

        <CouponInput />

        {stripeState.isReady ? null : <div styleName="loading-overlay" />}
      </div>

      <div styleName="modal-actions">
        <div styleName="modal-actions-info">
          {/* <a href="https://stripe.com">
            <PoweredByStripe />
          </a> */}
          <p styleName="modal-text--small secured-by">
            <LockIcon />
            Payments Secured by <a href="https://stripe.com/">Stripe</a>
          </p>
        </div>
        <div styleName="modal-buttons">
          <a
            styleName="modal-btn modal-btn--secondary modal-btn--cancel"
            onClick={() =>
              dispatch({ type: 'set-step', data: 'start-purchase' })
            }
          >
            Back
          </a>

          <Button
            basic
            compact
            stretch
            disabled={state.loading || !stripeState.isReady}
            loading={state.loading}
            type="submit"
            as="button"
            form="payment-form"
          >
            Pay {getDisplayPrice(state.selectedPackage)}
          </Button>
        </div>
      </div>
    </>
  );
}

export default injectStripe(CheckoutForm);

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
    url = `/api/checkout/new/${productId}/${coupon}`;
  } else {
    url = `/api/checkout/new/${productId}`;
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
