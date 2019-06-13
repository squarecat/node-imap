import './billing-modal.module.scss';

import React, { createContext, useEffect, useReducer } from 'react';
import billingModalReducer, { initialState } from './reducer';

import { Elements } from 'react-stripe-elements';
import ExistingBillingForm from './existing-billing-form';
import NewBillingForm from './new-billing-form';
import StartPurchaseForm from './start-purchase';
import Success from './success';
import request from '../../../utils/request';
import useUser from '../../../utils/hooks/use-user';

export const BillingModalContext = createContext({ state: initialState });

export default ({ selectedPackage, hasBillingCard }) => {
  const [state, dispatch] = useReducer(billingModalReducer, {
    ...initialState
  });
  const [user, { setBilling: setUserBilling }] = useUser();

  useEffect(
    () => {
      dispatch({
        type: 'init',
        data: {
          ...initialState,
          hasBillingCard,
          selectedPackage
        }
      });
    },
    [selectedPackage, hasBillingCard]
  );

  const onPurchaseSuccess = ({ billing }) => {
    setUserBilling(billing);
  };

  return (
    <div styleName="billing-modal">
      <Elements>
        <BillingModalContext.Provider value={{ state, dispatch }}>
          <div data-active={state.step === 'start-purchase'}>
            {state.step === 'start-purchase' ? (
              <StartPurchaseForm
                onPurchaseSuccess={user => onPurchaseSuccess(user)}
              />
            ) : null}
          </div>
          <div data-active={state.step === 'enter-billing-details'}>
            {state.step === 'enter-billing-details' ? (
              <NewBillingForm
                onPurchaseSuccess={user => onPurchaseSuccess(user)}
              />
            ) : null}
          </div>
          <div data-active={state.step === 'existing-billing-details'}>
            {state.step === 'existing-billing-details' ? (
              <ExistingBillingForm
                card={user.billing.card}
                onPurchaseSuccess={user => onPurchaseSuccess(user)}
              />
            ) : null}
          </div>
          <div data-active={state.step === 'success'}>
            {state.step === 'success' ? (
              <Success credits={state.selectedPackage.credits} />
            ) : null}
          </div>
        </BillingModalContext.Provider>
      </Elements>
    </div>
  );
};

export function getDisplayPrice({ price, discountAmount, discountPrice }) {
  const viewPrice = (price / 100).toFixed(2);
  if (discountAmount) {
    const viewDiscountPrice = (discountPrice / 100).toFixed(2);
    return (
      <span styleName="price">
        <span styleName="price-discounted">${viewPrice}</span> $
        {viewDiscountPrice}
      </span>
    );
  }

  return <span styleName="price">${viewPrice}</span>;
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
