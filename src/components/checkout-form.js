import React, { useState, useEffect } from 'react';
import useUser from '../utils/hooks/use-user';
import Button from './btn';

import { PAYMENT_CONFIG_OPTS, PAYMENT_CHECKOUT_OPTS } from '../utils/payments';

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

async function doCheckout({ description, amount, email }) {
  handler.open({
    ...PAYMENT_CHECKOUT_OPTS,
    description,
    amount,
    email
  });
}

const CheckoutForm = ({
  coupon,
  selected,
  onCheckoutComplete,
  onCheckoutFailed
}) => {
  const [isLoading, setLoading] = useState(false);
  const [userEmail] = useUser(s => s.email);

  const { price, discountedPrice, value, label: productName } = selected;

  useEffect(() => {
    onClose = () => {
      setLoading(false);
    };
  });
  useEffect(
    () => {
      callback = async (token, args) => {
        try {
          const address = {
            city: args.billing_address_city,
            country: args.billing_address_country,
            line1: args.billing_address_line1,
            line2: args.billing_address_line2,
            state: args.billing_address_state,
            postal_code: args.billing_address_zip
          };

          await sendPayment({
            token,
            productId: value,
            coupon,
            address,
            name: args.billing_name
          });
          onCheckoutComplete();
        } catch (err) {
          onCheckoutFailed(err);
        }
      };
    },
    [value, coupon]
  );

  return (
    <Button
      loading={isLoading}
      onClick={() => {
        setLoading(true);
        doCheckout({
          description: `${productName} scan`,
          amount: discountedPrice || price,
          email: userEmail
        });
      }}
      compact
    >
      Purchase
    </Button>
  );
};

export default CheckoutForm;

async function sendPayment({ token, productId, coupon, address, name }) {
  let url;
  if (coupon) {
    url = `/api/checkout/${productId}/${coupon}`;
  } else {
    url = `/api/checkout/${productId}`;
  }
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

export async function getCoupon(coupon) {
  try {
    const resp = await fetch(`/api/checkout/${coupon}`);
    const data = resp.json();
    return data;
  } catch (err) {
    console.log('coupon err');
    throw err;
  }
}
