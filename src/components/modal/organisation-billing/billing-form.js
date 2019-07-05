import { FormGroup, FormNotification } from '../../form';
import {
  ModalBody,
  ModalCloseIcon,
  ModalHeader,
  ModalPaymentSaveAction
} from '..';
import React, { useContext, useMemo, useReducer } from 'react';
import { TextFootnote, TextImportant } from '../../../components/text';
import reducer, { initialState } from './reducer';

import { ENTERPRISE } from '../../../../shared/prices';
import { ModalContext } from '../../../providers/modal-provider';
import PaymentAddressDetails from '../../payments/address-details';
import PaymentCardDetails from '../../payments/card-details';
// import PaymentCompanyDetails from '../../payments/company-details';
import { StripeStateContext } from '../../../providers/stripe-provider';
import { injectStripe } from 'react-stripe-elements';
import request from '../../../utils/request';

const DEFAULT_ERROR = 'Something went wrong, try again or contact support';

function OrganisationBillingForm({ stripe, organisation, onSuccess }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { state: stripeState } = useContext(StripeStateContext);
  const { close: closeModal } = useContext(ModalContext);

  const { id, billing = {}, currentUsers } = organisation;
  const { subscriptionId } = billing;

  const onPaymentSuccess = organisation => {
    closeModal();
    onSuccess(organisation);
  };

  async function onSubmit() {
    try {
      dispatch({ type: 'set-loading', data: true });
      dispatch({ type: 'set-error', data: false });

      const { addressDetails } = state;

      console.log('on submit', state);

      // TODO after Beta
      // 1. if vat number validate it

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
        let response;
        if (subscriptionId) {
          console.log('org already has subscription, update the card');
          response = await updateBilling(id, {
            token,
            ...customer
          });
        } else {
          response = await createSubscription(id, {
            token,
            ...customer
          });
        }
        await handlePaymentResponse(response);
        dispatch({ type: 'set-loading', data: false });
      }
    } catch (err) {
      console.error(err);
      dispatch({ type: 'set-loading', data: false });
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
      dispatch({ type: 'set-error', data: message });
    } else if (response.requires_payment_method) {
      dispatch({
        type: 'set-error',
        data:
          'An error occured charging your card, please enter different card details.'
      });
    } else if (response.requires_action) {
      await handleRequiresAction(response);
    } else {
      onPaymentSuccess(response.organisation);
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
      dispatch({ type: 'set-error', data: errorAction.message });
    } else {
      // The payment has succeeded. Display a success message.
      const updatedResponse = await confirmSubscription(id);
      onPaymentSuccess(updatedResponse.organisation);
    }
  }

  const initialPayment = ENTERPRISE.pricePerSeat * currentUsers.length;
  const infoText = useMemo(
    () => {
      if (currentUsers.length) {
        return (
          <p>
            You currently have{' '}
            <TextImportant>
              {`${currentUsers.length} member${
                currentUsers.length === 1 ? '' : 's'
              }`}
            </TextImportant>
            . You will be billed{' '}
            <TextImportant>
              ${(initialPayment / 100).toFixed(2)} monthly starting today
            </TextImportant>
            . Your plan will be updated automatically and prorated when members
            join or are removed.
          </p>
        );
      }
      return (
        <p>
          You currently have no members. Your card will be{' '}
          <TextImportant>authorised but not charged</TextImportant>. Your plan
          will be updated automatically and prorated when members join or are
          removed.
        </p>
      );
    },
    [currentUsers.length, initialPayment]
  );

  return (
    <form
      id="org-payment-form"
      onSubmit={e => {
        e.preventDefault();
        return onSubmit();
      }}
    >
      <ModalBody loading={!stripeState.isReady} compact>
        <ModalHeader>
          Add Payment Method
          <ModalCloseIcon />
        </ModalHeader>
        <p>
          You are signing up for the{' '}
          <TextImportant>Enterprise plan</TextImportant> billed monthly at{' '}
          <TextImportant>
            ${(ENTERPRISE.pricePerSeat / 100).toFixed(2)} per seat
          </TextImportant>
          .
        </p>
        {infoText}
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

        {/* <PaymentCompanyDetails
              companyDetails={state.companyDetails}
              loading={state.loading}
              onChange={(key, value) =>
                dispatch({
                  type: 'set-company-detail',
                  data: { key, value }
                })
              }
            /> */}

        {state.error ? (
          <FormGroup>
            <FormNotification error>
              {state.error.message || DEFAULT_ERROR}
            </FormNotification>
          </FormGroup>
        ) : null}

        <TextFootnote>
          I authorise Leave Me Alone to send instructions to the financial
          institution that issued my card to take payments from my card account
          in accordance with the terms of my agreement with you.
        </TextFootnote>
      </ModalBody>
      <ModalPaymentSaveAction
        isDisabled={state.loading || !stripeState.isReady}
        isLoading={state.loading}
        onCancel={closeModal}
        saveText={
          currentUsers.length
            ? `Save and Pay $${(initialPayment / 100).toFixed(2)}`
            : `Save Payment Method`
        }
      />
    </form>
  );
}

export default injectStripe(OrganisationBillingForm);

// eslint-disable-next-line no-unused-vars
function validateVatNumber(vatNumber) {
  return request('/api/payments/vat', {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ vatNumber })
  });
}

function createSubscription(organisationId, { token, name, address }) {
  return request('/api/payments/subscription', {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ organisationId, token, name, address })
  });
}

function updateBilling(organisationId, { token, name, address }) {
  return request(`/api/organisation/${organisationId}/billing`, {
    method: 'PATCH',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      op: 'update',
      value: { token, name, address }
    })
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

function getCustomer({ addressDetails }) {
  return {
    name: addressDetails.name,
    address: {
      line1: addressDetails.line1,
      line2: addressDetails.line2,
      city: addressDetails.city,
      country: addressDetails.country,
      postal_code: addressDetails.postal_code
    }
  };
}
