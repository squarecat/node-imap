import React, { useState, useEffect } from 'react';

import GiftCheckout from './gift-checkout';

import './gifts.css';
import '../btn.css';

export default ({ prices }) => {
  const [selected, setSelected] = useState('6m');
  const [coupon, setCoupon] = useState(null);

  const onCheckoutComplete = ({ coupon }) => {
    debugger;
    setCoupon(coupon);
  };

  return (
    <div className="gifts-prices">
      <p>
        Purchase one of our scans as a gift and you'll receive a coupon of equal
        value.
      </p>
      {prices.map(p => (
        <GiftCheckout
          key={p.value}
          onCheckoutFailed={() => {
            console.error('Checkout failed, what do?');
          }}
          onCheckoutComplete={data => onCheckoutComplete(data)}
          selected={p}
        />
      ))}
      {/* TODO */}
      {/* - open a modal on successful payment with a an email written that'll send to the receiver */}
      {/* - send confirmation email with coupon to the purchaser */}
      <div className={`gift-coupon ${coupon ? 'shown' : ''}`}>
        <p>
          Thank you for your purchase! Here is your coupon:{' '}
          <span className="text-important">{coupon}</span>
        </p>
        <p>We have also emailed you a copy for your records.</p>
        <p>Happy Holidays! 🎄</p>
      </div>
    </div>
  );
};
