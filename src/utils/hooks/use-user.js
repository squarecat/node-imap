import { globalReducer } from 'react-hook-utils';

export default globalReducer(null, {
  load: (state, user) => {
    console.log('loading user state');
    return {
      ...user,
      unsubCount: user.unsubscriptions.length || 0
    };
  },
  incrementUnsubCount: (state, count = 1) => {
    console.log('loading user state');
    return {
      ...state,
      unsubCount: state.unsubCount + count
    };
  },
  setHasSearched: (state, hasSearched) => ({
    ...state,
    hasSearched
  })
});
