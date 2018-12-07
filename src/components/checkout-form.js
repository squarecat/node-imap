import React, { useState, useEffect } from 'react';
import logo from '../assets/envelope-logo.png';
import Button from './btn';

let callback;
let onToken = () => callback();

const handler = window.StripeCheckout.configure({
  key: 'pk_test_td6LkJVGPINUdmgEnbonAGNk',
  image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
  locale: 'auto',
  token: onToken
});

function doCheckout({ description, amount }) {
  handler.open({
    name: 'LeaveMeAlone',
    description,
    zipCode: true,
    currency: 'usd',
    amount
  });
}

const CheckoutForm = ({
  selected,
  onCheckoutComplete,
  onCheckoutCancelled
}) => {
  const [isLoading, setLoading] = useState(false);

  const { price, value, label: productName } = selected;

  useEffect(
    () => {
      callback = async token => {
        debugger;
        setLoading(true);
        await saveToken({ token, productId: value });
        setLoading(false);
        debugger;
        // onCheckoutComplete();
      };
    },
    [value]
  );

  return (
    <Button
      loading={isLoading}
      onClick={() => doCheckout({ description: productName, amount: price })}
      compact
    >
      Purchase
    </Button>
  );
};

export default CheckoutForm;

async function saveToken({ productId }) {
  console.log(`saving token; /api/checkout/${productId}`);
  try {
    const resp = await fetch(`/api/checkout/${productId}`, {
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
