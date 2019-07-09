export const initialState = {
  addressDetails: {
    name: '',
    line1: '',
    line2: '',
    city: '',
    country: '',
    postal_code: ''
  }
  // companyDetails: {
  //   name: '',
  //   address: '',
  //   vatNumber: ''
  // }
};

function orgBillingModalReducer(state = initialState, action) {
  const { type, data } = action;
  switch (type) {
    case 'set-address-detail':
      return {
        ...state,
        addressDetails: {
          ...state.addressDetails,
          [data.key]: data.value
        }
      };
    // case 'set-company-detail':
    //   return {
    //     ...state,
    //     companyDetails: {
    //       ...state.companyDetails,
    //       [data.key]: data.value
    //     }
    //   };
    case 'set-loading':
      return { ...state, loading: data };
    case 'set-error':
      return { ...state, error: data };
    default:
      return state;
  }
}

export default orgBillingModalReducer;
