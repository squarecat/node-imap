import React from 'react';
import StripeCheckout from 'react-stripe-checkout';
import logo from '../assets/envelope-logo.png';

const CheckoutForm = ({ selected }) => {
  const { price, value: productId, label: productName } = selected;
  return (
    <StripeCheckout
      token={token => onToken(token, productId)}
      stripeKey="pk_test_td6LkJVGPINUdmgEnbonAGNk"
      name="Leave Me Alone"
      description={`Payment for ${productName} scan`}
      image={logo}
      amount={price}
      currency="USD"
      zipCode={true}
      locale="auto"
    />
  );
};

export default CheckoutForm;

async function onToken(token, productId) {
  try {
    const resp = await fetch(`/api/checkout/${productId}`, {
      method: 'POST',
      body: JSON.stringify(token)
    });
    const data = resp.json();
    return data;
  } catch (err) {
    console.log('payment err');
    throw err;
  }
}
// import React, { useEffect } from 'react';
// import { CardElement, injectStripe } from 'react-stripe-elements';

// const CheckoutForm = ({ stripe, selected }) => {
//   return (
//     <div className="checkout">
//       <p>Would you like to complete the purchase?</p>
//       <CardElement />
//       <button onClick={e => submit(e, { stripe, selected })}>Send</button>
//     </div>
//   );
// };

// async function submit(ev, { stripe, selected }) {
//   console.log('submit');
//   debugger;
//   // let { token } = await stripe.createToken({ name: 'Name' });
//   // let response = await fetch(`/api/checkout/${selected}`, {
//   //   method: 'POST',
//   //   headers: { 'Content-Type': 'text/plain' },
//   //   body: token.id
//   // });

//   // if (response.ok) console.log('Purchase Complete!');
// }

// export default injectStripe(CheckoutForm);
