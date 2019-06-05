import React, { createContext, useEffect, useReducer } from 'react';

import AlertBanner from '../components/alerts';

export const AlertContext = createContext(null);

const initialState = {
  current: null,
  next: null,
  queue: []
};
// mail reducer that represents the internal state
// of indexdb database
const AlertReducer = (state, action) => {
  switch (action.type) {
    case 'queue-alert': {
      return {
        ...state,
        queue: [...state.queue, action.data]
      };
    }
    case 'set-alert': {
      const defaults = {
        message: '',
        isShown: true,
        isDismissable: false,
        level: 'error',
        autoDismiss: true,
        dismissAfter: 5000,
        actions: []
      };
      const alert = {
        ...defaults,
        ...action.data
      };
      return {
        ...state,
        current: {
          id: Math.random()
            .toString()
            .substr(2),
          ...alert
        }
      };
    }
    case 'dismiss-alert': {
      const isNext = state.queue.length;
      if (!state.current || (action.data && action.data !== state.current.id)) {
        return state;
      }
      let next = null;
      let newQueue = [];
      if (isNext) {
        next = state.queue[0];
        newQueue = state.queue.slice(1);
      }
      return {
        ...state,
        current: null,
        next,
        queue: newQueue
      };
    }
    default: {
      return state;
    }
  }
};

export function AlertProvider({ children }) {
  const [state, dispatch] = useReducer(AlertReducer, initialState);
  const { current } = state;
  // if there's a new alert, then dismiss it
  // after a timeout
  useEffect(
    () => {
      if (current && current.autoDismiss) {
        setTimeout(() => {
          dispatch({ type: 'dismiss-alert' });
        }, current.dismissAfter);
      }
    },
    [current]
  );

  // after an alert has been dismissed, pop another
  // from the queue after a brief timeout
  useEffect(
    () => {
      if (state.queued) {
        setTimeout(() => {
          dispatch({ type: 'set-alert', data: state.queued });
        }, 1000);
      }
    },
    [state.queued]
  );

  function onDismiss(id) {
    dispatch({ type: 'dismiss-alert', data: id });
  }

  return (
    <AlertContext.Provider
      value={{
        state,
        actions: {
          setAlert: data => dispatch({ type: 'set-alert', data }),
          dismiss: id => onDismiss(id),
          queueAlert: data => dispatch({ type: 'add-alert-to-queue', data })
        }
      }}
    >
      {children}
      <AlertBanner alert={state.current} onDismiss={onDismiss} />
    </AlertContext.Provider>
  );
}
