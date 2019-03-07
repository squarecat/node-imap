import './gifts.module.scss';

import React, { useState } from 'react';
import { TextImportant, TextLink } from '../../components/text';

import { FormInput } from '../../components/form';
import GiftCheckout from './gift-checkout';
import _isArray from 'lodash.isarray';

export default ({ prices = [] } = {}) => {
  const [couponData, setCouponData] = useState(null);
  const [isCouponLoading, setCouponLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isQuantityShown, setQuantityShown] = useState(false);
  const [isPaymentError, setPaymentError] = useState(false);

  const onCheckoutComplete = ({ couponData }) => {
    setPaymentError(false);
    setCouponData(couponData);
    setQuantityShown(false);
    setQuantity(1);
  };

  const onPurchaseFailed = err => {
    console.error('purchase failed', err);
    setPaymentError(err);
  };

  return (
    <div styleName="gifts-prices">
      <p>Purchase scans below and you'll receive a coupon of equal value.</p>
      {prices.map(p => (
        <GiftCheckout
          key={p.value}
          setCouponLoading={val => setCouponLoading(val)}
          onCheckoutFailed={err => onPurchaseFailed(err)}
          onCheckoutComplete={data => onCheckoutComplete(data)}
          selected={p}
          quantity={quantity}
        />
      ))}
      {isPaymentError ? (
        <p styleName="gifts-payment-error">
          Something went wrong with your payment. You have not been charged.
          Please try again or contact support.
        </p>
      ) : null}
      <TextLink smaller onClick={() => setQuantityShown(true)}>
        Want to buy more than 1 scan?
      </TextLink>
      <div styleName={`gift-quantity-box ${isQuantityShown ? 'shown' : ''}`}>
        <FormInput
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={({ currentTarget }) => {
            setQuantity(currentTarget.value);
          }}
        />
      </div>
      <div
        styleName={`gift-coupon ${
          couponData || isCouponLoading ? 'shown' : ''
        }`}
      >
        {isCouponLoading ? (
          <>
            <p>Fetching your coupon{quantity > 1 ? 's' : ''}...</p>
            <div styleName="gift-loading" />
          </>
        ) : (
          <>
            {couponData && _isArray(couponData) ? (
              <>
                <p>Thank you for your purchase! Here are your coupons:</p>
                <div styleName="coupons-multi">
                  {couponData.map(c => (
                    <span key={c}>
                      <TextImportant>{c}</TextImportant>
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p>
                Thank you for your purchase! Here is your coupon:{' '}
                <TextImportant>{couponData}</TextImportant>
              </p>
            )}
            <p>We have also emailed you a copy for your records.</p>
          </>
        )}
      </div>
    </div>
  );
};
