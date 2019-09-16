import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef
} from 'react';

import AlertBanner from '../components/alerts';

export const AlertContext = createContext(null);

const initialState = {
  current: null,
  next: null,
  queue: []
};
const defaultAlert = () => ({
  message: '',
  isShown: true,
  isDismissable: false,
  level: 'error',
  autoDismiss: true,
  dismissAfter: 5000,
  actions: []
});
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
      const alert = {
        ...defaultAlert(),
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
      const dismissId = action.data;
      const isExisting = !!state.current;
      if (!isExisting) {
        return state;
      }
      if (dismissId && dismissId !== state.current.id) {
        return state;
      }
      return {
        ...state,
        current: null
      };
    }
    case 'hide-alert': {
      const dismissId = action.data;
      const isExisting = !!state.current;

      if (!isExisting) {
        return state;
      }
      if (dismissId && dismissId !== state.current.id) {
        return state;
      }
      return {
        ...state,
        current: {
          ...state.current,
          isShown: false
        }
      };
    }
    case 'set-next': {
      let next = null;
      const isNext = state.queue.length;
      let newQueue = [];
      if (isNext) {
        next = {
          ...defaultAlert(),
          ...state.queue[0]
        };
        newQueue = state.queue.slice(1);
      }
      return {
        ...state,
        current: next,
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
  const { current, queue } = state;
  const dismissTimeout = useRef(null);
  const nextTimeout = useRef(null);
  const onDismiss = useCallback(id => {
    dispatch({ type: 'hide-alert', data: id });
    setTimeout(() => {
      return dispatch({ type: 'dismiss-alert', data: id });
    }, 500);
  }, []);
  // if there's a new alert, then dismiss it
  // after a timeout
  useEffect(() => {
    if (current && current.autoDismiss) {
      clearTimeout(dismissTimeout.current);
      dismissTimeout.current = setTimeout(onDismiss, current.dismissAfter);
    }
    if (!current && queue.length) {
      clearTimeout(nextTimeout.current);
      nextTimeout.current = setTimeout(() => {
        dispatch({ type: 'hide-alert' });
        setTimeout(() => dispatch({ type: 'set-next' }), 500);
      }, 500);
    }
    return () => {
      clearTimeout(dismissTimeout.current);
      clearTimeout(nextTimeout.current);
    };
  }, [current, onDismiss, queue]);

  const value = useMemo(() => {
    const actions = {
      setAlert: data => dispatch({ type: 'set-alert', data }),
      dismiss: id => onDismiss(id),
      queueAlert: data => dispatch({ type: 'queue-alert', data })
    };
    return {
      actions
    };
  }, [onDismiss]);

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AlertBanner alert={state.current} onDismiss={onDismiss} />
    </AlertContext.Provider>
  );
}

//AlertProvider.whyDidYouRender = true;
