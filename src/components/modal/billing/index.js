import './billing-modal.module.scss';

import React, { createContext, useEffect, useMemo, useReducer } from 'react';
import billingModalReducer, { initialState } from './reducer';

import { Elements } from 'react-stripe-elements';
import ExistingBillingForm from './existing-billing-form';
import NewBillingForm from './new-billing-form';
import StartPurchaseForm from './start-purchase';
import { StripeProvider } from '../../../providers/stripe-provider';
import Success from './success';
import request from '../../../utils/request';

export const BillingModalContext = createContext({ state: initialState });

export default ({ selectedPackage, billingCard, onPurchaseSuccess }) => {
  const initialStep = useMemo(
    () => (billingCard ? 'existing-billing-details' : 'start-purchase'),
    [billingCard]
  );

  const [state, dispatch] = useReducer(billingModalReducer, {
    ...initialState,
    step: initialStep
  });

  useEffect(
    () => {
      dispatch({
        type: 'init',
        data: {
          ...initialState,
          step: initialStep,
          selectedPackage
        }
      });
    },
    [initialStep, selectedPackage]
  );

  const stepWidth = useMemo(
    () => {
      if (
        state.step === 'enter-billing-details' ||
        state.step === 'existing-billing-details'
      ) {
        return 800;
      }
      return 550;
    },
    [state.step]
  );

  const style = useMemo(() => ({ width: stepWidth }), [stepWidth]);

  return (
    <div styleName="billing-modal" style={style}>
      <StripeProvider>
        <Elements>
          <BillingModalContext.Provider value={{ state, dispatch }}>
            {state.step === 'start-purchase' ? (
              <StartPurchaseForm
                hasBillingCard={!!billingCard}
                onPurchaseSuccess={user => onPurchaseSuccess(user)}
              />
            ) : null}
            {state.step === 'enter-billing-details' ? (
              <NewBillingForm
                hasBillingCard={!!billingCard}
                onPurchaseSuccess={user => onPurchaseSuccess(user)}
              />
            ) : null}
            {state.step === 'existing-billing-details' ? (
              <ExistingBillingForm
                billingCard={billingCard}
                onPurchaseSuccess={user => onPurchaseSuccess(user)}
              />
            ) : null}
            {state.step === 'success' ? (
              <Success credits={state.selectedPackage.credits} />
            ) : null}
          </BillingModalContext.Provider>
        </Elements>
      </StripeProvider>
    </div>
  );
};

export function getDisplayPrice(
  { price, discountAmount, discountPrice },
  donate = false
) {
  const donateAmount = getDonateAmount(donate);
  const viewPrice = ((price + donateAmount) / 100).toFixed(2);
  if (discountAmount) {
    const viewDiscountPrice = ((discountPrice + donateAmount) / 100).toFixed(2);
    return (
      <span styleName="price">
        <span styleName="price-discounted">${viewPrice}</span> $
        {viewDiscountPrice}
      </span>
    );
  }

  return <span styleName="price">${viewPrice}</span>;
}

export function getDonateAmount(donate) {
  if (donate) return 100;
  return 0;
}

export async function confirmIntent({ paymentIntent, productId, coupon }) {
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
    body: JSON.stringify({ payment_intent_id: paymentIntent.id })
  });
}
