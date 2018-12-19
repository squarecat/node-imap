import React, { useState } from 'react';
import _isArray from 'lodash.isarray';

import GiftCheckout from './gift-checkout';

import './gifts.css';
import '../btn.css';

export default ({ prices }) => {
  const [couponData, setCouponData] = useState(null);
  const [isCouponLoading, setCouponLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isQuantityShown, setQuantityShown] = useState(false);

  const onCheckoutComplete = ({ couponData }) => {
    setCouponData(couponData);
    setQuantityShown(false);
    setQuantity(1);
  };

  return (
    <div className="gifts-prices">
      <p>
        Purchase one of the scans below and you'll receive a coupon of equal
        value.
      </p>
      {prices.map(p => (
        <GiftCheckout
          key={p.value}
          setCouponLoading={val => setCouponLoading(val)}
          onCheckoutFailed={() => {
            console.error('Checkout failed, what do?');
          }}
          onCheckoutComplete={data => onCheckoutComplete(data)}
          selected={p}
          quantity={quantity}
        />
      ))}
      <a className="link add-quantity" onClick={() => setQuantityShown(true)}>
        Want to buy more than 1 scan?
      </a>
      <div className={`gift-quantity-box ${isQuantityShown ? 'shown' : ''}`}>
        <input
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
        className={`gift-coupon ${
          couponData || isCouponLoading ? 'shown' : ''
        }`}
      >
        {isCouponLoading ? (
          <>
            <p>Fetching your coupon{quantity > 1 ? 's' : ''}...</p>
            <div className="gift-loading" />
          </>
        ) : (
          <>
            {couponData && _isArray(couponData) ? (
              <>
                <p>Thank you for your purchase! Here are your coupons:</p>
                <div className="coupons-multi">
                  {couponData.map(c => (
                    <span key={c} className="text-important">
                      {c}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p>
                Thank you for your purchase! Here is your coupon:{' '}
                <span className="text-important">{couponData}</span>
              </p>
            )}
            <p>We have also emailed you a copy for your records.</p>
            <p>Happy Holidays! 🎄</p>
          </>
        )}
      </div>
    </div>
  );
};
