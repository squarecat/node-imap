import React, { createContext, useEffect, useState } from 'react';

import { StripeProvider as ReactStripeProvider } from 'react-stripe-elements';

export const StripeStateContext = createContext(null);

export function StripeProvider({ children }) {
  const [stripe, setStripe] = useState(null);

  // pass stripe instance which will load when initialised
  // for async script loads
  // https://github.com/stripe/react-stripe-elements#advanced-integrations
  useEffect(() => {
    require('scriptjs')('https://js.stripe.com/v3/', function() {
      if (window.Stripe) {
        setStripe(window.Stripe(process.env.STRIPE_PK));
      }
    });
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
          setReady: el => setState({ ...state, isReady: true, cardRef: el }),
          reset: () => setState(initialState)
        }
      }}
    >
      {children}
    </StripeStateContext.Provider>
  );
}
