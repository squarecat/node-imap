import '../modal.module.scss';

import React, { createContext, useEffect, useReducer, useState } from 'react';

import CheckoutForm from './checkout-form';
import ExistingBillingForm from './existing-billing-form';
import ModalClose from '../modal-close';
import { fetchLoggedInUser } from '../../../utils/auth';
import useUser from '../../../utils/hooks/use-user';
import { StarIcon } from '../../icons';

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
    case 'set-billing-details':
      return {
        ...state,
        [data.key]: data.value
      };
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
  coupon: ''
};

export const BillingModalContext = createContext({ state: initialState });

export default ({
  onClose,
  selectedPackage,
  step = 'enter-billing-details'
}) => {
  const [isShown, setShown] = useState(false);
  const [state, dispatch] = useReducer(billingModalReducer, {
    ...initialState,
    step,
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
          data-active={state.step === 'enter-billing-details'}
        >
          {state.step === 'enter-billing-details' ? (
            <>
              <h3>Buy Package</h3>
              <CheckoutForm
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
