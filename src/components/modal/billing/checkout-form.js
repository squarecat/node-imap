import '../modal.module.scss';

import { CardElement, injectStripe } from 'react-stripe-elements';
import {
  FormCheckbox,
  FormGroup,
  FormInput,
  FormNotification,
  FormSelect
} from '../../form';
import React, { useContext, useEffect, useRef, useState } from 'react';

import { BillingModalContext } from './index';
import Button from '../../btn';
import { LockIcon } from '../../icons';
import { useAsync } from '../../../utils/hooks';
import useUser from '../../../utils/hooks/use-user';

const DEFAULT_ERROR = 'Something went wrong, try again or contact support';

const cardElementOptions = {
  hidePostalCode: true,
  style: {
    base: {
      iconColor: '#bfbfbf',
      color: '#333333',
      lineHeight: '46px',
      fontWeight: 300,
      fontFamily: 'Gotham-Rounded, Helvetica Neue',
      fontSize: '16px',
      '::placeholder': {
        color: '#bfbfbf'
      }
    },
    invalid: {
      color: '#f1645f'
    }
  }
};

function CheckoutForm({ stripe, onClickClose, onPurchaseSuccess }) {
  const { state, dispatch } = useContext(BillingModalContext);
  const cardElement = useRef(null);

  const [{ email }] = useUser(u => u.email);

  const [stripeLoading, setStripeLoading] = useState(true);

  const { value: countries, loading: countriesLoading } = useAsync(
    fetchCountries
  );
  const [options, setOptions] = useState([]);

  useEffect(
    () => {
      if (!countriesLoading) {
        const options = countries.map(c => ({ value: c.code, label: c.name }));
        setOptions(options);
      }
    },
    [countriesLoading]
  );

  async function onSubmit() {
    try {
      dispatch({ type: 'set-loading', data: true });
      dispatch({ type: 'set-error', data: false });

      const billingDetails = {
        name: state.name,
        email,
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
        cardElement.current._element,
        { billing_details: billingDetails }
      );
      if (paymentError) {
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
      cardElement,
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
    <form
      id="payment-form"
      onSubmit={e => {
        e.preventDefault();
        return onSubmit();
      }}
      method="post"
    >
      <div styleName="modal-content">
        <p>
          Enter your card details to purchase a package of{' '}
          {state.selectedPackage.unsubscribes} unsubscribes for $
          {(state.selectedPackage.price / 100).toFixed(2)}.
        </p>
        <FormGroup>
          <FormInput
            smaller
            disabled={state.loading}
            required
            placeholder="Name"
            value={state.name}
            name="name"
            onChange={e => {
              dispatch({
                type: 'set-billing-details',
                data: { key: 'name', value: e.currentTarget.value }
              });
            }}
          />
        </FormGroup>

        <FormGroup container>
          <FormInput
            smaller
            disabled={state.loading}
            required
            basic
            placeholder="Address"
            value={state.line1}
            name="Address"
            onChange={e => {
              dispatch({
                type: 'set-billing-details',
                data: { key: 'line1', value: e.currentTarget.value }
              });
            }}
          />
          <FormInput
            smaller
            disabled={state.loading}
            required
            basic
            placeholder="City"
            value={state.city}
            name="City"
            onChange={e => {
              dispatch({
                type: 'set-billing-details',
                data: { key: 'city', value: e.currentTarget.value }
              });
            }}
          />
          <FormSelect
            smaller
            disabled={state.loading}
            required
            basic
            value={state.country}
            placeholder="Country"
            options={options}
            onChange={e => {
              dispatch({
                type: 'set-billing-details',
                data: { key: 'country', value: e.currentTarget.value }
              });
            }}
          />
          <FormInput
            smaller
            disabled={state.loading}
            required
            basic
            placeholder={state.country === 'US' ? 'Zipcode' : 'Postal code'}
            value={state.postal_code}
            name="postal_code"
            onChange={e => {
              dispatch({
                type: 'set-billing-details',
                data: { key: 'postal_code', value: e.currentTarget.value }
              });
            }}
          />
        </FormGroup>

        <FormGroup>
          <CardElement
            ref={cardElement}
            {...cardElementOptions}
            onReady={() => setStripeLoading(false)}
          />
        </FormGroup>

        {state.error ? (
          <FormNotification error>
            {state.error.message || DEFAULT_ERROR}
          </FormNotification>
        ) : null}

        <FormGroup>
          <FormCheckbox
            onChange={() =>
              dispatch({
                type: 'set-billing-details',
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

        {stripeLoading ? <div styleName="loading-overlay" /> : null}
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
            onClick={onClickClose}
          >
            Cancel
          </a>

          <Button
            basic
            compact
            stretch
            disabled={state.loading || stripeLoading}
            loading={state.loading}
            type="submit"
            as="button"
          >
            Pay ${(state.selectedPackage.price / 100).toFixed(2)}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default injectStripe(CheckoutForm);

function fetchCountries() {
  return fetch('/api/countries.json').then(resp => resp.json());
}

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
  const resp = await fetch(url, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ payment_method_id: id, name, address, saveCard })
  });
  return resp.json();
}

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
