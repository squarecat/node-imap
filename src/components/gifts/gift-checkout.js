import React, { useState, useEffect } from 'react';
import logo from '../../assets/envelope-logo.png';
import Button from '../btn';

let callback;
let onClose;
let onToken = t => callback(t);
let handler;
if (typeof window !== 'undefined' && window.StripeCheckout) {
  handler = window.StripeCheckout.configure({
    key: `${process.env.STRIPE_PK}`,
    image: logo,
    locale: 'auto',
    closed: () => onClose(),
    token: onToken
  });
}

async function doCheckout({ description, amount }) {
  handler.open({
    name: 'Leave Me Alone',
    description,
    zipCode: true,
    currency: 'usd',
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

  useEffect(() => {
    onClose = () => {
      setLoading(false);
    };
  });
  useEffect(
    () => {
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
    },
    [value]
  );

  return (
    <Button
      loading={isLoading}
      onClick={() => {
        setLoading(true);
        doCheckout({
          description: `Gift a ${productName} scan`,
          amount: price
        });
      }}
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
