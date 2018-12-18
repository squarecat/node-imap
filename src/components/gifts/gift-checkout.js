import React, { useState } from 'react';
import Button from '../btn';

import {
  PAYMENT_CONFIG_OPTS,
  PAYMENT_CHECKOUT_OPTS
} from '../../utils/payments';

let callback;
let onClose;
let onToken = t => callback(t);
let handler;

if (typeof window !== 'undefined' && window.StripeCheckout) {
  handler = window.StripeCheckout.configure({
    ...PAYMENT_CONFIG_OPTS,
    closed: () => onClose(),
    token: onToken
  });
}

async function doCheckout({ description, amount }) {
  handler.open({
    ...PAYMENT_CHECKOUT_OPTS,
    description,
    amount
  });
}

const GiftCheckout = ({
  selected,
  setCouponLoading,
  onCheckoutComplete,
  onCheckoutFailed
}) => {
  const [isLoading, setLoading] = useState(false);
  const { price, value, label: productName } = selected;

  function onClick() {
    setLoading(true);
    onClose = () => {
      setLoading(false);
    };
    callback = async token => {
      setCouponLoading(true);
      try {
        const data = await sendGiftPayment({ token, productId: value });
        onCheckoutComplete(data);
        setCouponLoading(false);
      } catch (err) {
        console.error(err);
        onCheckoutFailed(err);
        setCouponLoading(false);
      }
    };
    doCheckout({
      description: `Gift a ${productName} scan`,
      amount: price
    });
  }

  return (
    <Button
      loading={isLoading}
      onClick={() => onClick()}
      compact={true}
      muted={true}
    >
      <span>{selected.label}</span>
      <span className="price">{`($${selected.price / 100})`}</span>
    </Button>
  );
};

export default GiftCheckout;

async function sendGiftPayment({ token, productId }) {
  console.log('payment for', productId);
  const url = `/api/gift/${productId}`;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(token)
    });
    const data = resp.json();
    return data;
  } catch (err) {
    console.log('payment err');
    throw err;
  }
}
