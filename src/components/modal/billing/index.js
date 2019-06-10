import '../modal.module.scss';

import React, { createContext, useEffect, useReducer, useState } from 'react';

import ExistingBillingForm from './existing-billing-form';
import ModalClose from '../modal-close';
import NewBillingForm from './new-billing-form';
import { StarIcon } from '../../icons';
import StartPurchaseForm from './start-purchase';
// import { fetchLoggedInUser } from '../../../utils/auth';
import request from '../../../utils/request';
import useUser from '../../../utils/hooks/use-user';

function billingModalReducer(state, action) {
  const { type, data } = action;
  switch (type) {
    case 'set-step': {
      return {
        ...state,
        step: data,
        loading: false,
        error: false
      };
    }
    case 'set-billing-detail':
      return {
        ...state,
        [data.key]: data.value
      };
    case 'set-coupon':
      return {
        ...state,
        coupon: data
      };
    case 'set-package-discount-amount': {
      const { price } = state.selectedPackage;
      return {
        ...state,
        selectedPackage: {
          ...state.selectedPackage,
          discountAmount: data,
          discountPrice: price - data
        }
      };
    }
    case 'set-loading':
      return { ...state, loading: data };
    case 'set-error':
      return { ...state, error: data };
    default:
      return state;
  }
}

const initialState = {
  name: '',
  line1: '',
  line2: '',
  city: '',
  country: '',
  postal_code: '',
  save_payment_method: true,
  coupon: '',
  step: 'start-purchase',
  selectedPackage: {}
};

// Steps
// start-purchase
// enter-billing-details - new billing details/checkout
// existing-billing-details - use existing billing details
// success - done screen

export const BillingModalContext = createContext({ state: initialState });

export default ({ onClose, selectedPackage, hasBillingCard }) => {
  const [isShown, setShown] = useState(false);
  const [state, dispatch] = useReducer(billingModalReducer, {
    ...initialState,
    hasBillingCard,
    selectedPackage
  });
  const [user, { setBilling: setUserBilling }] = useUser();

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

  const onPurchaseSuccess = ({ billing }) => {
    setUserBilling(billing);
  };

  return (
    <BillingModalContext.Provider value={{ state, dispatch }}>
      <div styleName={`modal ${isShown ? 'shown' : ''}`}>
        <ModalClose onClose={onClickClose} />
        <div
          // styleName="enter-billing-details-box"
          data-active={state.step === 'start-purchase'}
        >
          {state.step === 'start-purchase' ? (
            <>
              <h3>Buy Package</h3>
              <StartPurchaseForm />
            </>
          ) : null}
        </div>
        <div
          // styleName="enter-billing-details-box"
          data-active={state.step === 'enter-billing-details'}
        >
          {state.step === 'enter-billing-details' ? (
            <>
              <h3>Buy Package</h3>
              <NewBillingForm
                onClickClose={onClickClose}
                onPurchaseSuccess={user => onPurchaseSuccess(user)}
              />
            </>
          ) : null}
        </div>
        <div
          // styleName="enter-billing-details-box"
          data-active={state.step === 'existing-billing-details'}
        >
          {state.step === 'existing-billing-details' ? (
            <>
              <h3>Buy Package</h3>
              <ExistingBillingForm
                card={user.billing.card}
                onPurchaseSuccess={user => onPurchaseSuccess(user)}
              />
            </>
          ) : null}
        </div>
        <div
          // styleName="enter-billing-details-box"
          data-active={state.step === 'success'}
        >
          {state.step === 'success' ? (
            <>
              <h3>Payment Successful</h3>
              <div styleName="modal-content">
                <div styleName="billing-success">
                  <StarIcon width="50" height="50" />
                  <p>
                    You now have {state.selectedPackage.unsubscribes} more
                    unsubscribe credits!
                  </p>
                </div>
              </div>
              <div styleName="modal-actions">
                <a
                  styleName="modal-btn modal-btn--cta"
                  onClick={() => {
                    onClickClose();
                  }}
                >
                  Awesome!
                </a>
              </div>
            </>
          ) : null}
        </div>
      </div>
      <div styleName={`modal-bg ${isShown ? 'shown' : ''}`} />
    </BillingModalContext.Provider>
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
