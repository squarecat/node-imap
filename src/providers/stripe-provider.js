import React, { createContext, useEffect, useState } from 'react';

import { StripeProvider as ReactStripeProvider } from 'react-stripe-elements';

export const StripeStateContext = createContext(null);

export function StripeProvider({ children }) {
  const [stripe, setStripe] = useState(null);

  // pass stripe instance which will load when initialised
  // for async script loads
  // https://github.com/stripe/react-stripe-elements#advanced-integrations
  useEffect(() => {
    if (window.Stripe) {
      console.log('stripe-provider: initialising Stripe from window');
      setStripe(window.Stripe(process.env.STRIPE_PK));
    } else {
      console.log('stripe-provider: doing query selector');
      const stripEl = document.querySelector('#stripe-js');
      stripEl.addEventListener('load', () => {
        // Create Stripe instance once Stripe.js loads
        setStripe(window.Stripe(process.env.STRIPE_PK));
      });
    }
  }, []);

  return (
    <ReactStripeProvider stripe={stripe}>
      <StripeStateProvider>{children}</StripeStateProvider>
    </ReactStripeProvider>
  );
}

const initialState = {
  cardRef: null,
  isReady: false
};

function StripeStateProvider({ children }) {
  const [state, setState] = useState(initialState);

  return (
    <StripeStateContext.Provider
      value={{
        state,
        actions: {
          setCardRef: r => setState({ ...state, cardRef: r }),
          setReady: () => setState({ ...state, isReady: true }),
          reset: () => setState(initialState)
        }
      }}
    >
      {children}
    </StripeStateContext.Provider>
  );
}
