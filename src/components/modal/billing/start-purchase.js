import { ModalBody, ModalCloseIcon, ModalHeader, ModalSaveAction } from '..';
import React, { useContext } from 'react';

import { BillingModalContext } from './index';
import CouponForm from './coupon';
import { ModalContext } from '../../../providers/modal-provider';
import PlanImage from '../../../components/pricing/plan-image';
import Price from '../../../components/pricing/price';
import { TextImportant } from '../../text';
import request from '../../../utils/request';

const DEFAULT_ERROR = `An error occured claiming your free credits, please contact support.`;

export default function StartPurchase({ onPurchaseSuccess }) {
  const { close: closeModal } = useContext(ModalContext);
  const { state, dispatch } = useContext(BillingModalContext);
  const { selectedPackage, hasBillingCard, coupon } = state;

  const billingStep = hasBillingCard
    ? 'existing-billing-details'
    : 'enter-billing-details';
  const isFree = selectedPackage.discountPrice < 50 || process.env.BETA;

  async function handleFreeCredits() {
    try {
      dispatch({ type: 'set-loading', data: true });
      const response = await claimCredits({
        productId: selectedPackage.id,
        coupon
      });
      handleResponse(response);
    } catch (err) {
      dispatch({
        type: 'set-error',
        error: DEFAULT_ERROR
      });
    } finally {
      dispatch({ type: 'set-loading', data: false });
    }
  }

  async function handleResponse(response) {
    if (response.error) {
      let message = DEFAULT_ERROR;
      if (response.error.message) {
        message = response.error.message;
      }
      dispatch({ type: 'set-error', error: message });
    } else {
      onPurchaseSuccess(response.user);
      dispatch({ type: 'set-step', data: 'success' });
    }
  }

  return (
    <>
      <ModalBody compact>
        <ModalHeader>
          Buy Package
          <ModalCloseIcon />
        </ModalHeader>
        <p>
          Purchasing a package of{' '}
          <TextImportant>{selectedPackage.credits} credits.</TextImportant>
        </p>
        <PlanImage smaller compact type="package" />
        <Price
          price={selectedPackage.price}
          discounted={selectedPackage.discountAmount}
        />
        {selectedPackage.discountAmount ? (
          <Price price={selectedPackage.discountPrice} />
        ) : null}
        <CouponForm />
      </ModalBody>

      <ModalSaveAction
        isDisabled={state.loading}
        isLoading={state.loading}
        onSave={() => {
          if (isFree) {
            return handleFreeCredits();
          }
          return dispatch({ type: 'set-step', data: billingStep });
        }}
        onCancel={closeModal}
        saveText={isFree ? 'Claim Free Credits!' : 'Secure Checkout'}
      />
    </>
  );
}

async function claimCredits({ productId, coupon }) {
  const url = `/api/payments/claim/${productId}/${coupon}`;
  return request(url, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}
