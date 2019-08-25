import { ModalBody, ModalCloseIcon, ModalHeader, ModalSaveAction } from '..';
import React, { useContext } from 'react';

import { BillingModalContext } from './index';
import CouponForm from './coupon';
import { ModalContext } from '../../../providers/modal-provider';
import PlanImage from '../../../components/pricing/plan-image';
import Price from '../../../components/pricing/price';
import { TextImportant } from '../../text';
import { getPaymentError } from '../../../utils/errors';
import request from '../../../utils/request';

export default function StartPurchase({ hasBillingCard, onPurchaseSuccess }) {
  const { close: closeModal } = useContext(ModalContext);
  const { state, dispatch } = useContext(BillingModalContext);
  const { selectedPackage, coupon } = state;

  const billingStep = hasBillingCard
    ? 'existing-billing-details'
    : 'enter-billing-details';

  const isFree = selectedPackage.discountPrice < 50;

  async function handleFreeCredits() {
    try {
      dispatch({ type: 'set-loading', data: true });
      const response = await claimCredits({
        productId: selectedPackage.id,
        coupon
      });
      handleResponse(response);
    } catch (err) {
      const message = getPaymentError(err);
      dispatch({
        type: 'set-error',
        error: message
      });
    } finally {
      dispatch({ type: 'set-loading', data: false });
    }
  }

  async function handleResponse(response) {
    onPurchaseSuccess(response.user);
    dispatch({ type: 'set-step', data: 'success' });
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
        <PlanImage type="package" />
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
    method: 'POST'
  });
}
