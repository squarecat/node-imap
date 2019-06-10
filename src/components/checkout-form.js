import { PAYMENT_CHECKOUT_OPTS, PAYMENT_CONFIG_OPTS } from '../utils/payments';
import React, { useEffect, useState } from 'react';

import Button from '../components/btn';
import request from '../utils/request';
import useUser from '../utils/hooks/use-user';

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
    onClose = () => {};
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
        } finally {
          setLoading(false);
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

export async function sendPayment({ token, productId, coupon, address, name }) {
  let url;
  if (coupon) {
    url = `/api/payments/checkout/${productId}/${coupon}`;
  } else {
    url = `/api/payments/checkout/${productId}`;
  }
  try {
    const data = await request(url, {
      method: 'POST',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ token, address, name })
    });
    return data;
  } catch (err) {
    console.log('payment err');
    throw err;
  }
}

export async function getCoupon(coupon) {
  try {
    const data = await request(`/api/payments/checkout/${coupon}`);
    return data;
  } catch (err) {
    console.log('coupon err');
    throw err;
  }
}
