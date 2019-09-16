export default (state, action) => {
  const { type, data } = action;
  if (type === 'set-organisation') {
    return {
      ...state,
      organisation: {
        ...state.organisation,
        ...data
      }
    };
  }
  if (type === 'set-loading') {
    return {
      ...state,
      loading: data
    };
  }
  if (type === 'set-error') {
    return {
      ...state,
      error: data
    };
  }
  return state;
};
