import { CardElement, injectStripe } from 'react-stripe-elements';

import React from 'react';

function CheckoutForm({ createPaymentMethod }) {
  async function onSubmit() {
    // const { paymentMethod } = await createPaymentMethod('card', cardElement);
    return true;
  }
  return (
    <form onSubmit={onSubmit}>
      <label>
        Card details
        {/* <CardElement style={{ base: { fontSize: '18px' } }} /> */}
      </label>
    </form>
  );
}

// function AddressSection() {}

// function CardSection() {
//   return (
//     <label>

//     </label>
//   );
// }

export default injectStripe(CheckoutForm);
