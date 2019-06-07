import '../modal.module.scss';

import { FormGroup, FormNotification } from '../../form';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import reducer, { initialState } from './reducer';

import Button from '../../btn';
import { LockIcon } from '../../icons';
import ModalClose from '../modal-close';
import PaymentAddressDetails from '../../payments/address-details';
import PaymentCardDetails from '../../payments/card-details';
import PaymentCompanyDetails from '../../payments/company-details';
import { StripeStateContext } from '../../../providers/stripe-provider';
import { injectStripe } from 'react-stripe-elements';

const DEFAULT_ERROR = 'Something went wrong, try again or contact support';

function OrganisationBillingModal({ onClose }) {
  const [isShown, setShown] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { state: stripeState } = useContext(StripeStateContext);

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

  async function onSubmit() {
    try {
      dispatch({ type: 'set-loading', data: true });
      dispatch({ type: 'set-error', data: false });

      const { billingDetails, companyDetails } = state;

      const customer = {
        name: billingDetails.name,
        address: {
          line1: billingDetails.line1,
          line2: billingDetails.line2,
          city: billingDetails.city,
          country: billingDetails.country,
          postal_code: billingDetails.postal_code
        }
      };
      const company = {
        name: companyDetails.name,
        vatNumber: companyDetails.vatNumber
      };

      // TODO
      // 1. if vat number validate it
      // 2. create token with card details
      // 3. send to server
      // 4. create customer
      // 5. create subscription

      // const { taxId, error: taxError } = await validateVatNumber(
      //   company.vatNumber
      // );

      console.log('on submit', customer, company);
      return true;
    } catch (err) {
      console.error(err);
      dispatch({
        type: 'set-error',
        data: DEFAULT_ERROR
      });
    } finally {
      dispatch({ type: 'set-loading', data: false });
    }
  }

  return (
    // <OrganisationBillingModalContext.Provider value={{ state, dispatch }}>
    <>
      <div styleName={`modal ${isShown ? 'shown' : ''}`}>
        <ModalClose onClose={onClickClose} />
        <h3>Add Organisation Payment Method</h3>
        <div styleName="modal-content">
          <p>Provide your company details for invoicing.</p>
          <form
            id="org-payment-form"
            onSubmit={e => {
              e.preventDefault();
              return onSubmit();
            }}
            method="post"
          >
            <PaymentAddressDetails
              addressDetails={state.addressDetails}
              loading={state.loading}
              onChange={(key, value) =>
                dispatch({
                  type: 'set-address-detail',
                  data: { key, value }
                })
              }
            />

            <PaymentCardDetails />

            <PaymentCompanyDetails
              companyDetails={state.companyDetails}
              loading={state.loading}
              onChange={(key, value) =>
                dispatch({
                  type: 'set-company-detail',
                  data: { key, value }
                })
              }
            />

            {state.error ? (
              <FormGroup>
                <FormNotification error>
                  {state.error.message || DEFAULT_ERROR}
                </FormNotification>
              </FormGroup>
            ) : null}
          </form>
          {stripeState.isReady ? null : <div styleName="loading-overlay" />}
        </div>

        <div styleName="modal-actions">
          <div styleName="modal-actions-info">
            <p styleName="modal-text--small secured-by">
              <LockIcon />
              Payments Secured by <a href="https://stripe.com/">Stripe</a>
            </p>
          </div>

          <div styleName="modal-buttons">
            <a
              styleName="modal-btn modal-btn--secondary modal-btn--cancel"
              onClick={() => onClickClose()}
            >
              Cancel
            </a>

            <Button
              basic
              compact
              stretch
              disabled={state.loading || !stripeState.isReady}
              loading={state.loading}
              type="submit"
              as="button"
              form="org-payment-form"
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
      <div styleName={`modal-bg ${isShown ? 'shown' : ''}`} />
      {/* </OrganisationBillingModalContext.Provider> */}
    </>
  );
}

export default injectStripe(OrganisationBillingModal);
