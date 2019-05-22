import '../modal.module.scss';

import React, { useContext } from 'react';

import { BillingModalContext } from './index';
import Button from '../../../components/btn';
import CouponForm from './coupon';
import PlanImage from '../../../components/pricing/plan-image';
import Price from '../../../components/pricing/price';
import { TextImportant } from '../../text';

export default function StartPurchase({ onClickClose }) {
  const { state, dispatch } = useContext(BillingModalContext);
  const { selectedPackage, hasBillingCard } = state;

  const billingStep = hasBillingCard
    ? 'existing-billing-details'
    : 'enter-billing-details';
  const isFree = selectedPackage.discountPrice === 0 || process.env.BETA;

  return (
    <>
      <div styleName="modal-content">
        <p>
          Purchasing a package of{' '}
          <TextImportant>
            {selectedPackage.unsubscribes} unsubscribes.
          </TextImportant>
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
      </div>
      <div styleName="modal-actions">
        <div styleName="modal-buttons">
          <a
            styleName="modal-btn modal-btn--secondary modal-btn--cancel"
            onClick={onClickClose}
          >
            Cancel
          </a>

          <Button
            basic
            compact
            stretch
            disabled={state.loading}
            loading={state.loading}
            onClick={() => {
              if (isFree) {
                return dispatch({ type: 'set-step', data: 'success' });
              }
              return dispatch({ type: 'set-step', data: billingStep });
            }}
          >
            {isFree ? 'Claim Free Package!' : 'Secure Checkout'}
          </Button>
        </div>
      </div>
    </>
  );
}
