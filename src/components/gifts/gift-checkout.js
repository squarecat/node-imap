import React, { useState } from 'react';
import Button from '../btn';

import {
  PAYMENT_CONFIG_OPTS,
  PAYMENT_CHECKOUT_OPTS
} from '../../utils/payments';

let callback;
let onClose;
let onToken = (t, args) => callback(t, args);
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
    callback = async (token, args) => {
      setCouponLoading(true);
      try {
        const address = {
          city: args.billing_address_city,
          country: args.billing_address_country,
          line1: args.billing_address_line1,
          line2: args.billing_address_line2,
          state: args.billing_address_state,
          postal_code: args.billing_address_zip
        };
        const data = await sendGiftPayment({
          token,
          productId: value,
          address,
          name: args.billing_name
        });
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

async function sendGiftPayment({ token, productId, address, name }) {
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
      body: JSON.stringify({ token, address, name })
    });
    const data = resp.json();
    return data;
  } catch (err) {
    console.log('payment err');
    throw err;
  }
}
