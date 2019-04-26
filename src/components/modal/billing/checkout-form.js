import './checkout-form.module.scss';

import { CardElement, injectStripe } from 'react-stripe-elements';
import {
  FormCheckbox,
  FormGroup,
  FormInput,
  FormNotification,
  FormSelect
} from '../../form';
import React, { useEffect, useRef, useState } from 'react';

import Button from '../../btn';
import { PACKAGES } from '../../../utils/prices';
import { useAsync } from '../../../utils/hooks';
import useUser from '../../../utils/hooks/use-user';

const textFields = [
  {
    name: 'line1',
    label: 'Line 1'
  },
  {
    name: 'line2',
    label: 'Line 2'
  },
  {
    name: 'city',
    label: 'City'
  }
];

const cardElementOptions = {
  hidePostalCode: true,
  style: {
    base: {
      iconColor: '#bfbfbf',
      color: '#333333',
      lineHeight: '56px',
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

function CheckoutForm({ stripe, selectedPackage }) {
  const { value: countries, loading: countriesLoading } = useAsync(
    fetchCountries
  );
  const [{ email, billing }, { setPackagePurchased }] = useUser(u => u.email);
  const cardElement = useRef(null);

  const [events, setEvents] = useState({
    loading: false,
    error: false,
    success: false
  });

  const [options, setOptions] = useState([]);

  const [state, setState] = useState({
    name: '',
    line1: '',
    line2: '',
    city: '',
    country: '',
    postal_code: '',
    save_payment_method: true,
    coupon: ''
  });

  useEffect(
    () => {
      if (!countriesLoading) {
        const options = countries.map(c => ({ value: c.code, label: c.name }));
        setOptions(options);
        setState({ ...state, country: options[0].value });
      }
    },
    [countriesLoading]
  );

  async function onSubmit() {
    try {
      console.log('on submit function');
      setEvents({ ...events, loading: true });

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
        console.log('stripe error', paymentError);
        setEvents({ ...events, error: paymentError });
      } else {
        console.log('stripe intent success', paymentMethod);
        const response = await confirmPayment({
          paymentMethod,
          productId: selectedPackage.id,
          coupon: state.coupon,
          ...billingDetails
        });
        handleConfirmPaymentResponse(response, { productId: selectedPackage.id, coupon: state.coupon });
      }
    } catch (err) {
      console.error(err);
      setEvents({
        ...events,
        error: 'Something went wrong your card has not been charged'
      });
    } finally {
      setEvents({ ...events, loading: false });
    }
  }

  async function handleConfirmPaymentResponse(response, { productId, coupon }) {
    if (response.error) {
      console.error('handle confirm payment response error');
      console.error(response.error);
      setEvents({ ...events, error: response.error });
    } else if (response.requires_action) {
      console.log('payment requires action');
      // Use Stripe.js to handle the required card action
      const {
        error: errorAction,
        paymentIntent
      } = await stripe.handleCardAction(
        response.payment_intent_client_secret,
        cardElement,
        { save_payment_method: state.save_payment_method }
      );

      if (errorAction) {
        // Show error from Stripe.js in payment form
        console.log('handle card action error', errorAction);
        setEvents({ ...events, error: errorAction });
      } else {
        // The card action has been handled
        // The PaymentIntent can be confirmed again on the server
        const response = await confirmIntent({
          paymentIntent,
          productId,
          coupon
        });
        handleConfirmPaymentResponse(response);
      }
    } else {
      // Show success message
      setPackagePurchased({
        unsubscribes: selectedPackage.unsubscribes,
        packageId: selectedPackage.id
      });
      // TODO close modal
      setEvents({ ...events, error: false, success: true });
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
      <FormGroup>
        <CardElement ref={cardElement} {...cardElementOptions} />
      </FormGroup>
      <FormGroup>
        <FormInput
          compact
          placeholder="Name"
          value={state.name}
          name="name"
          onChange={e => {
            setState({
              ...state,
              name: e.currentTarget.value
            });
          }}
        />
      </FormGroup>

      <div styleName="address">
        <FormGroup container>
          {textFields.map(field => (
            <FormInput
              key={field.name}
              compact
              basic
              placeholder={field.label}
              value={state[field.name]}
              name={field.name}
              onChange={e => {
                setState({
                  ...state,
                  [field.name]: e.currentTarget.value
                });
              }}
            />
          ))}
          <FormSelect
            compact
            basic
            value={state.country}
            options={options}
            onChange={e => {
              setState({
                ...state,
                country: e.currentTarget.value
              });
            }}
          />
          <FormInput
            compact
            basic
            placeholder={state.country === 'US' ? 'Zipcode' : 'Postal code'}
            value={state.postal_code}
            name="postal_code"
            onChange={e => {
              setState({
                ...state,
                postal_code: e.currentTarget.value
              });
            }}
          />
        </FormGroup>
        <FormGroup>
          <FormCheckbox
            onChange={() =>
              setState({
                ...state,
                save_payment_method: !state.save_payment_method
              })
            }
            checked={state.save_payment_method}
            label="Save payment method"
          />
        </FormGroup>
      </div>
      {events.error ? (
        <FormNotification error>
          {events.error.message ||
            'Something went wrong your card has not been charged'}
        </FormNotification>
      ) : null}
      {events.success ? (
        <FormNotification success>Success!</FormNotification>
      ) : null}
      <FormGroup>
        <Button
          basic
          compact
          stretch
          loading={events.loading}
          type="submit"
          as="button"
        >
          Pay ${(selectedPackage.price / 100).toFixed(2)}
        </Button>
      </FormGroup>
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
  address
}) {
  const { id } = paymentMethod;
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
    },
    body: JSON.stringify({ payment_method_id: id, name, address })
  });
  return resp.json();
}

async function confirmIntent({ paymentIntent, productId, coupon }) {
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
    },
    body: JSON.stringify({ payment_intent_id: paymentIntent.id })
  });
  return resp.json();
}
