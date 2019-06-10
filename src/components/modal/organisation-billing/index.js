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
import request from '../../../utils/request';

const DEFAULT_ERROR = 'Something went wrong, try again or contact support';

function OrganisationBillingModal({
  stripe,
  shown,
  onClose,
  organisation,
  onSuccess
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { state: stripeState } = useContext(StripeStateContext);

  async function onSubmit() {
    try {
      dispatch({ type: 'set-loading', data: true });
      dispatch({ type: 'set-error', data: false });

      const { addressDetails } = state;

      console.log('on submit', state);

      // TODO
      // 1. if vat number validate it
      // 2. create token with card details
      // 3. send to server
      // 4. create customer
      // 5. create subscription

      // const { taxId, error: taxError } = await validateVatNumber(
      //   company.vatNumber
      // );

      const customer = getCustomer(state);

      const { token, error } = await stripe.createToken({
        // the createToken address arguments are named differently to create customer...
        name: addressDetails.name,
        address_line1: addressDetails.line1,
        address_line2: addressDetails.line2,
        address_city: addressDetails.city,
        address_country: addressDetails.country,
        address_zip: addressDetails.postal_code
      });

      if (error) {
        console.error(error);
        dispatch({ type: 'set-error', data: error });
      } else {
        const response = await createSubscription(organisation.id, {
          token,
          ...customer
        });
        await handlePaymentResponse(response);
        dispatch({ type: 'set-loading', data: false });
      }
    } catch (err) {
      console.error(err);
      dispatch({
        type: 'set-error',
        data: DEFAULT_ERROR
      });
    }
  }

  async function handlePaymentResponse(response) {
    if (response.error) {
      let message = DEFAULT_ERROR;
      if (response.error.message) {
        message = response.error.message;
      }
      dispatch({ type: 'set-error', error: message });
    } else if (response.requires_payment_method) {
      dispatch({
        type: 'set-error',
        error:
          'An error occured charging your card, please enter different card details.'
      });
    } else if (response.requires_action) {
      await handleRequiresAction(response);
    } else {
      onSuccess(response.organisation);
    }
  }

  async function handleRequiresAction(response) {
    const customer = getCustomer(state);
    // Use Stripe.js to handle the required card action
    // this is a different function to the charges
    const { error: errorAction } = await stripe.handleCardPayment(
      response.payment_intent_client_secret,
      {},
      {
        payment_method_data: {
          billing_details: customer
        }
      }
    );

    if (errorAction) {
      // Display error.message in your UI.
      dispatch({ type: 'set-error', error: errorAction.message });
    } else {
      // The payment has succeeded. Display a success message.
      const updatedResponse = await confirmSubscription(organisation.id);
      onSuccess(updatedResponse.organisation);
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
          onSubmit={e => {
            e.preventDefault();
            return onSubmit();
          }}
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

            <PaymentCardDetails loading={state.loading} />

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
            // onSave={() => onSubmit()}
            onCancel={onClose}
          />
        </form>
      </Modal>
    </>
  );
}

export default injectStripe(OrganisationBillingModal);

// function validateVatNumber(vatNumber) {
//   return request('/api/payments/vat', {
//     method: 'POST',
//     cache: 'no-cache',
//     credentials: 'same-origin',
//     headers: {
//       'Content-Type': 'application/json; charset=utf-8'
//     },
//     body: JSON.stringify({ vatNumber })
//   });
// }

function createSubscription(organisationId, { token, name, address, company }) {
  return request('/api/payments/subscription', {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ organisationId, token, name, address, company })
  });
}

function confirmSubscription(organisationId) {
  return request('/api/payments/subscription/confirm', {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ organisationId })
  });
}
function getCustomer({ addressDetails, companyDetails }) {
  return {
    name: addressDetails.name,
    address: {
      line1: addressDetails.line1,
      line2: addressDetails.line2,
      city: addressDetails.city,
      country: addressDetails.country,
      postal_code: addressDetails.postal_code
    },
    company: {
      name: companyDetails.name,
      vatNumber: companyDetails.vatNumber
    }
  };
}
