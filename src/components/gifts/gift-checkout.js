import React, { useState } from 'react';
import Button from '../btn';
import numeral from 'numeral';

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
  quantity = 1,
  setCouponLoading,
  onCheckoutComplete,
  onCheckoutFailed
}) => {
  const [isLoading, setLoading] = useState(false);
  const { price, value, label: productName } = selected;

  const parsedQuantity = !quantity || isNaN(+quantity) ? 1 : +quantity;

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
          name: args.billing_name,
          quantity: parsedQuantity
        });
        onCheckoutComplete(data);
        setCouponLoading(false);
      } catch (err) {
        onCheckoutFailed(err);
        setCouponLoading(false);
      }
    };
    const { discountedPrice } = calculatePrice(price, parsedQuantity);
    doCheckout({
      description:
        parsedQuantity > 1
          ? `Gift ${parsedQuantity} ${productName} scans`
          : `Gift a ${productName} scan`,
      amount: discountedPrice
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
      <span className="price">
        {getDisplayPrice(selected.price, parsedQuantity)}
      </span>
    </Button>
  );
};

export default GiftCheckout;

const getDisplayPrice = (price, quantity) => {
  const { totalPrice, discountedPrice } = calculatePrice(price, quantity);
  if (discountedPrice < totalPrice) {
    return (
      <span>
        {priceFormat(discountedPrice)}
        <span className="price--discounted">{priceFormat(totalPrice)}</span>
      </span>
    );
  }
  return priceFormat(discountedPrice);
};

function priceFormat(price) {
  return price % 2 > 0
    ? numeral(price / 100).format('$0,0.00')
    : numeral(price / 100).format('$0,0');
}
function calculatePrice(price, quantity) {
  let discount = 0;
  if (quantity > 50) {
    discount = (price / 100) * 40;
  }
  if (quantity > 4 && quantity <= 50) {
    discount = (price / 100) * 25;
  }
  const regularPrice = price * quantity;
  const discountedPrice = (price - discount) * quantity;
  return {
    totalPrice: regularPrice,
    discountedPrice
  };
}

async function sendGiftPayment({ token, productId, address, name, quantity }) {
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
      body: JSON.stringify({ token, address, name, quantity })
    });
    const data = resp.json();
    return data;
  } catch (err) {
    console.log('payment err');
    throw err;
  }
}
