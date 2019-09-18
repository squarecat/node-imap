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
import { getPaymentError } from '../../../utils/errors';
import { injectStripe } from 'react-stripe-elements';
import request from '../../../utils/request';
import format from 'date-fns/format';

function OrganisationBillingForm({ stripe, organisation, onSuccess }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { state: stripeState } = useContext(StripeStateContext);
  const { close: closeModal } = useContext(ModalContext);

  const { id, billing = {}, currentUsers } = organisation;
  const { subscriptionId, discountPercentOff } = billing;

  const onPaymentSuccess = organisation => {
    closeModal();
    onSuccess(organisation);
  };

  async function onSubmit() {
    try {
      dispatch({ type: 'set-loading', data: true });
      dispatch({ type: 'set-error', data: false });

      const { addressDetails } = state;
      const customer = getCustomer(state);

      const { token, tokenError } = await stripe.createToken({
        // the createToken address arguments are named differently to create customer...
        name: addressDetails.name,
        address_line1: addressDetails.line1,
        address_line2: addressDetails.line2,
        address_city: addressDetails.city,
        address_country: addressDetails.country,
        address_zip: addressDetails.postal_code
      });

      if (tokenError) {
        dispatch({ type: 'set-error', data: tokenError.message });
      } else {
        let response;
        if (subscriptionId) {
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
      }
    } catch (err) {
      const message = getPaymentError(err);
      dispatch({
        type: 'set-error',
        data: message
      });
    } finally {
      dispatch({ type: 'set-loading', data: false });
    }
  }

  async function handlePaymentResponse(response) {
    if (response.requires_payment_method) {
      const message = getPaymentError(response);
      dispatch({
        type: 'set-error',
        data: message
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

  const seats = currentUsers.length;

  const {
    totalAmount,
    planPrice,
    initialPlanPrice,
    discountAmount
  } = useMemo(() => {
    const initialPayment = ENTERPRISE.pricePerSeat * seats;
    let totalAmount = initialPayment / 100;
    let planPrice = ENTERPRISE.pricePerSeat / 100;
    let discountAmount = 0;
    if (discountPercentOff) {
      totalAmount = totalAmount - totalAmount * (discountPercentOff / 100);
      planPrice = planPrice - planPrice * (discountPercentOff / 100);
      discountAmount = initialPayment * (discountPercentOff / 100);
    }
    return {
      totalAmount: totalAmount.toFixed(2),
      planPrice: planPrice.toFixed(2),
      initialPlanPrice: (ENTERPRISE.pricePerSeat / 100).toFixed(2),
      discountAmount
    };
  }, [discountPercentOff, seats]);

  const lead = (
    <>
      <p>
        You are signing up for the <TextImportant>Teams plan</TextImportant>{' '}
        billed monthly at{' '}
        <TextImportant>
          {discountAmount ? (
            <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>
              ${initialPlanPrice}
            </span>
          ) : null}{' '}
          ${planPrice} per seat
        </TextImportant>
        . Awesome!
      </p>
    </>
  );

  const paymentText = useMemo(() => {
    if (subscriptionId) {
      return (
        <p>
          Click below to update your card details, your subscription amount and
          billing cycle will not be affected.
        </p>
      );
    }

    if (seats) {
      return (
        <>
          <p>
            You are currently using{' '}
            <TextImportant>
              {`${seats} seat${seats === 1 ? '' : 's'}`}
            </TextImportant>
            .
          </p>
          <p>
            Click below to charge your card{' '}
            <TextImportant>${totalAmount}</TextImportant> now and on the{' '}
            {format(new Date(), 'do')} of each month thereafter.
          </p>
          <p>
            Your account will be instantly activated. Your subscription will be
            updated automatically and prorated when people join or leave your
            team. You can cancel at any time.
          </p>
        </>
      );
    }
    return (
      <>
        <p>
          You are currently using no seats. Until people join your team you will
          won't be billed.
        </p>
        <p>
          Click below to{' '}
          <TextImportant>
            add your card details. You will not be charged
          </TextImportant>{' '}
          anything.
        </p>
        <p>
          Your account will be instantly activated. Your subscription will be
          updated automatically and prorated when people join or leave your
          team. You can cancel at any time.
        </p>
      </>
    );
  }, [totalAmount, seats, subscriptionId]);

  const saveText = useMemo(() => {
    if (subscriptionId) {
      return `Update my card`;
    }
    if (currentUsers.length) {
      return `Charge my card $${totalAmount}`;
    }
    return `Add my card and charge $0`;
  }, [totalAmount, currentUsers.length, subscriptionId]);

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
          {subscriptionId
            ? 'Update payment details'
            : 'Complete your payment details'}
          <ModalCloseIcon />
        </ModalHeader>

        {lead}

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

        {paymentText}

        {state.error ? (
          <FormGroup>
            <FormNotification error>{state.error}</FormNotification>
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
        saveText={saveText}
      />
    </form>
  );
}

export default injectStripe(OrganisationBillingForm);

// eslint-disable-next-line no-unused-vars
function validateVatNumber(vatNumber) {
  return request('/api/payments/vat', {
    method: 'POST',

    body: JSON.stringify({ vatNumber })
  });
}

function createSubscription(organisationId, { token, name, address }) {
  return request('/api/payments/subscription', {
    method: 'POST',

    body: JSON.stringify({ organisationId, token, name, address })
  });
}

function updateBilling(organisationId, { token, name, address }) {
  return request(`/api/organisation/${organisationId}/billing`, {
    method: 'PATCH',

    body: JSON.stringify({
      op: 'update',
      value: { token, name, address }
    })
  });
}

function confirmSubscription(organisationId) {
  return request('/api/payments/subscription/confirm', {
    method: 'POST',

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
