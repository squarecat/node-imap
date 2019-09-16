export default (state, action) => {
  const { type, data } = action;
  if (type === 'set-org-detail') {
    return {
      ...state,
      orgDetails: {
        ...state.orgDetails,
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
