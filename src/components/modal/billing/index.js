import '../modal.module.scss';

import {
  Elements,
  StripeProvider,
  CardElement,
  injectStripe
} from 'react-stripe-elements';
import React, { useEffect, useState, useRef } from 'react';

import ModalClose from '../modal-close';
import { getPackage } from '../../../utils/prices';
import { useAsync } from '../../../utils/hooks';
import useUser from '../../../utils/hooks/use-user';
import {
  FormNotification,
  FormInput,
  FormGroup,
  FormLabel,
  FormSelect
} from '../../form';
import Button from '../../btn';
import { LockIcon } from '../../icons';

const textFields = [
  {
    name: 'name',
    label: 'Name'
  },
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

function BillingModal({ onClose, packageId = '1', onPurchase }) {
  const [isShown, setShown] = useState(true);

  const packageDetails = getPackage(packageId);

  const handleKeydown = e => {
    if (e.keyCode === 27 || e.key === 'Escape') {
      onClickClose();
    }
  };

  // on mount
  useEffect(() => {
    setShown(true);
    document.addEventListener('keydown', handleKeydown, false);
    return function cleanup() {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const onClickClose = () => {
    setShown(false);
    setTimeout(onClose, 300);
  };

  // const onClickRescan = async timeframe => {
  //   setShown(false);
  //   setTimeout(() => {
  //     return onRescan(timeframe);
  //   }, 300);
  // };

  // const onClickPurchase = async () => {
  //   setShown(false);
  //   setTimeout(() => {
  //     return onPurchase();
  //   }, 300);
  // };

  return (
    <StripeProvider apiKey={process.env.STRIPE_PK}>
      <Elements>
        <div styleName={`modal ${isShown ? 'shown' : ''}`}>
          <ModalClose onClose={onClickClose} />
          <h3>Buy Package</h3>
          <CheckoutForm
            packageDetails={packageDetails}
            onClickClose={onClickClose}
          />
        </div>
        <div styleName={`modal-bg ${isShown ? 'shown' : ''}`} />
      </Elements>
    </StripeProvider>
  );
}

export default BillingModal;

function BillingBox({ stripe, packageDetails, onClickClose }) {
  const { value: countries, loading: countriesLoading } = useAsync(
    fetchCountries
  );
  const cardElement = useRef(null);

  const [{ email }] = useUser(u => u.email);

  const [error, setError] = useState(null);
  const [options, setOptions] = useState([]);
  const [state, setState] = useState({
    name: '',
    email,
    line1: '',
    line2: '',
    city: '',
    country: '',
    postal_code: ''
  });

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
      console.log('on submit function');
      const {
        paymentMethod,
        error: paymentError
      } = await stripe.createPaymentMethod(
        'card',
        cardElement.current._element,
        { billing_details: { name: 'Jenny Rosen' } }
      );
      if (paymentError) {
        console.log('stripe error', paymentError);
        setError(paymentError);
      } else {
        console.log('stripe intent success', paymentMethod);
        // TODO do server stuff with { payment_method_id: paymentMethod.id }
      }
    } catch (err) {
      console.error(err);
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
        {/* <p>
          Complete purchase of {packageDetails.unsubscriptions} unsubscriptions
          for ${(packageDetails.price/100).toFixed(2)}
        </p> */}
        <FormGroup fluid>
          <FormLabel htmlFor="email">Email</FormLabel>
          <FormInput
            compact
            type="email"
            value={state.email}
            name="email"
            onChange={e => {
              setState({
                ...state,
                email: e.currentTarget.value
              });
            }}
          />
        </FormGroup>
        {textFields.map(field => (
          <FormGroup fluid key={field.name}>
            <FormLabel htmlFor={field.name}>{field.label}</FormLabel>
            <FormInput
              compact
              value={state[field.name]}
              name={field.name}
              onChange={e => {
                setState({
                  ...state,
                  [field.name]: e.currentTarget.value
                });
              }}
            />
          </FormGroup>
        ))}
        <FormGroup fluid>
          <FormLabel htmlFor="country">Country</FormLabel>
          <FormSelect
            compact
            value={state.country}
            options={options}
            onChange={e => {
              setState({
                ...state,
                country: e.currentTarget.value
              });
            }}
          />
        </FormGroup>
        <FormGroup fluid>
          <FormLabel htmlFor="postal_code">
            {state.country === 'US' ? 'Zipcode' : 'Postal code'}
          </FormLabel>
          <FormInput
            compact
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
        <CardElement ref={cardElement} />
        {error ? (
          <FormNotification error>{error.message}</FormNotification>
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
            onClick={onClickClose}
          >
            Cancel
          </a>
          <Button
            basic
            compact
            stretch
            loading={state.loading}
            type="submit"
            as="button"
          >
            Buy package
          </Button>
        </div>
      </div>
    </form>
  );
}

const CheckoutForm = injectStripe(BillingBox);

function fetchCountries() {
  return fetch('/api/countries.json').then(resp => resp.json());
}
