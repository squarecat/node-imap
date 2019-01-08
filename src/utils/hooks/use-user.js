import { globalReducer } from 'react-hook-utils';

export default globalReducer(
  {},
  {
    load: (state, user) => {
      return {
        ...user,
        loaded: true,
        unsubCount: user.unsubscriptions.length || 0
      };
    },
    incrementUnsubCount: (state, count = 1) => {
      return {
        ...state,
        unsubCount: state.unsubCount + count
      };
    },
    setHasSearched: (state, hasSearched) => ({
      ...state,
      hasSearched
    }),
    setIgnoredSenderList: (state, list) => ({
      ...state,
      ignoredSenderList: list
    })
  }
);
