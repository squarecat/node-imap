import './organisation-billing.module.scss';

import { FormGroup, FormNotification } from '../../form';
import Modal, {
  ModalBody,
  ModalCloseIcon,
  ModalHeader,
  ModalPaymentSaveAction
} from '..';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import reducer, { initialState } from './reducer';

import PaymentAddressDetails from '../../payments/address-details';
import PaymentCardDetails from '../../payments/card-details';
import PaymentCompanyDetails from '../../payments/company-details';
import { StripeStateContext } from '../../../providers/stripe-provider';
import { injectStripe } from 'react-stripe-elements';

const DEFAULT_ERROR = 'Something went wrong, try again or contact support';

function OrganisationBillingModal({ shown, onClose }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { state: stripeState } = useContext(StripeStateContext);

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
    <>
      <Modal
        shown={shown}
        onClose={onClose}
        dismissable={false}
        // style={{ width: 580 }}
      >
        <ModalCloseIcon />
        <form
          id="org-payment-form"
          // onSubmit={e => {
          //   e.preventDefault();
          //   return onSubmit();
          // }}
        >
          <ModalBody loading={!stripeState.isReady}>
            <ModalHeader>Add Organisation Payment Method</ModalHeader>
            <p>Provide your company details for invoicing.</p>
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
          </ModalBody>
          <ModalPaymentSaveAction
            isDisabled={state.loading || !stripeState.isReady}
            isLoading={state.loading}
            onSave={() => onSubmit()}
            onCancel={onClose}
          />
        </form>
      </Modal>
    </>
  );
}

export default injectStripe(OrganisationBillingModal);
