import React, { createContext, useState, useEffect } from 'react';
import { StripeProvider as ReactStripeProvider } from 'react-stripe-elements';

export const StripeStateContext = createContext(null);

export function StripeProvider({ children }) {
  const [stripe, setStripe] = useState(null);

  // pass stripe instance which will load when initialised
  // for async script loads
  // https://github.com/stripe/react-stripe-elements#advanced-integrations
  useEffect(
    () => {
      if (window.Stripe) {
        console.log('initialising Stripe');
        setStripe(window.Stripe(process.env.STRIPE_PK));
      }
    },
    [window.Stripe]
  );

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
