export const initialState = {
  name: '',
  line1: '',
  line2: '',
  city: '',
  country: '',
  postal_code: '',
  save_payment_method: true,
  coupon: '',
  step: 'start-purchase',
  selectedPackage: {}
};

function billingModalReducer(state, action) {
  const { type, data } = action;
  switch (type) {
    case 'init': {
      return action.data;
    }
    case 'set-step': {
      return {
        ...state,
        step: data,
        loading: false,
        error: false
      };
    }
    case 'set-billing-detail':
      return {
        ...state,
        [data.key]: data.value
      };
    case 'set-coupon':
      return {
        ...state,
        coupon: data
      };
    case 'set-package-discount-amount': {
      const { price } = state.selectedPackage;
      return {
        ...state,
        selectedPackage: {
          ...state.selectedPackage,
          discountAmount: data,
          discountPrice: price - data
        }
      };
    }
    case 'set-loading':
      return { ...state, loading: data };
    case 'set-error':
      return { ...state, error: data };
    default:
      return state;
  }
}

export default billingModalReducer;
