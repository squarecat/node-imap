import { globalReducer } from 'react-hook-utils';

export default globalReducer(true, {
  setLoading: (state, bool) => {
    return bool;
  }
});
