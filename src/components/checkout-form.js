import React, { useState, useEffect } from 'react';
import useUser from '../utils/hooks/use-user';
import logo from '../assets/envelope-logo.png';
import Button from './btn';

let callback;
let onToken = t => callback(t);

const handler = window.StripeCheckout.configure({
  key: 'pk_test_td6LkJVGPINUdmgEnbonAGNk',
  image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
  locale: 'auto',
  closed: () => callback(false),
  token: onToken
});

async function doCheckout({ description, amount, email, coupon }) {
  let price = amount;

  if (coupon) {
    const { percent_off, amount_off } = await getCoupon(coupon);
    if (percent_off) {
      price = amount - amount * (percent_off / 100);
    } else if (amount_off) {
      price = amount - amount_off;
    }
  }

  handler.open({
    name: 'LeaveMeAlone',
    description,
    zipCode: true,
    currency: 'usd',
    amount: price,
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

  const { price, value, label: productName } = selected;

  useEffect(
    () => {
      callback = async token => {
        try {
          if (!token) {
            return onCheckoutFailed();
          }
          await sendPayment({ token, productId: value, coupon });
          onCheckoutComplete();
        } catch (err) {
          console.error(err);
          onCheckoutFailed();
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
          description: productName,
          amount: price,
          email: userEmail,
          coupon
        });
      }}
      compact
    >
      Purchase
    </Button>
  );
};

export default CheckoutForm;

async function sendPayment({ token, productId, coupon }) {
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
      body: JSON.stringify(token)
    });
    const data = resp.json();
    return data;
  } catch (err) {
    console.log('payment err');
    throw err;
  }
}

async function getCoupon(coupon) {
  try {
    const resp = await fetch(`/api/checkout/${coupon}`);
    const data = resp.json();
    return data;
  } catch (err) {
    console.log('coupon err');
    throw err;
  }
}
