import '../modal.module.scss';
import React, { useContext } from 'react';
import CardDetails from './card-details';
import { BillingModalContext } from './index';
import { injectStripe } from 'react-stripe-elements';
import { LockIcon } from '../../icons';
import { FormNotification } from '../../form';
import Button from '../../btn';

const DEFAULT_ERROR = 'Something went wrong, try again or contact support';

const ExistingForm = ({ stripe, card, onPurchaseSuccess }) => {
  const { state, dispatch } = useContext(BillingModalContext);

  async function onSubmit() {
    try {
      dispatch({ type: 'set-loading', data: true });
      const response = await confirmPaymentExistingCard({
        productId: state.selectedPackage.id,
        coupon: state.coupon
      });
      handleResponse(response);
    } catch (err) {
      dispatch({
        type: 'set-error',
        data: 'Something went wrong, try again or contact support'
      });
    } finally {
      dispatch({ type: 'set-loading', data: false });
    }
  }

  // TODO a lot of duplication from checkout form
  async function handleResponse(response) {
    if (response.error) {
      let message = DEFAULT_ERROR;
      if (response.error.message) {
        message = response.error.message;
      }
      dispatch({ type: 'set-error', error: message });
    } else if (response.requires_action) {
      await handleRequiresAction(response);
    } else if (response.requires_payment_method) {
      dispatch({ type: 'set-step', data: 'enter-billing-details' });
    } else {
      onPurchaseSuccess(response.user);
      dispatch({ type: 'set-step', data: 'success' });
    }
  }

  async function handleRequiresAction(response) {
    // Use Stripe.js to handle the required card action
    const { error: errorAction, paymentIntent } = await stripe.handleCardAction(
      response.payment_intent_client_secret
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
      <div styleName="modal-content">
        <p>
          Confirm purchase a package of {state.selectedPackage.unsubscribes}{' '}
          unsubscribes for ${(state.selectedPackage.price / 100).toFixed(2)}.
        </p>
        <CardDetails card={card} />
        {state.error ? (
          <FormNotification error>
            {state.error.message || DEFAULT_ERROR}
          </FormNotification>
        ) : null}
      </div>
      <div styleName="modal-actions">
        <div styleName="modal-actions-info">
          <p styleName="modal-text--small secured-by">
            <LockIcon />
            Payments Secured by{' '}
            <a href="https://stripe.com/docs/security/stripe">Stripe</a>
          </p>
        </div>
        <div styleName="modal-buttons">
          <a
            styleName="modal-btn modal-btn--secondary modal-btn--cancel"
            onClick={() =>
              dispatch({ type: 'set-step', data: 'enter-billing-details' })
            }
          >
            Use a different card
          </a>
          <Button
            basic
            compact
            stretch
            disabled={state.loading}
            loading={state.loading}
            type="submit"
            as="button"
          >
            Pay ${(state.selectedPackage.price / 100).toFixed(2)} with this card
          </Button>
        </div>
      </div>
    </form>
  );
};

export default injectStripe(ExistingForm);

async function confirmPaymentExistingCard({ productId, coupon }) {
  let url;
  if (coupon) {
    url = `/api/checkout/${productId}/${coupon}`;
  } else {
    url = `/api/checkout/${productId}`;
  }
  const resp = await fetch(url, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
  return resp.json();
}
// TODO is duplicate of checkout form
async function confirmIntent({ paymentIntent, productId, coupon }) {
  let url;
  if (coupon) {
    url = `/api/checkout/new/${productId}/${coupon}`;
  } else {
    url = `/api/checkout/new/${productId}`;
  }
  const resp = await fetch(url, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ payment_intent_id: paymentIntent.id })
  });
  return resp.json();
}
