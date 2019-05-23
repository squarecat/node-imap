export const initialState = {
  mail: [],
  page: 0,
  count: 0,
  orderBy: 'date',
  perPage: 20,
  filterValues: {
    recipients: []
  },
  activeFilters: [],
  sortByValue: 'date',
  sortByDirection: 'asc'
};

// mail reducer that represents the internal state
// of indexdb database
const mailReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case 'remove-active-filters': {
      return {
        ...state,
        activeFilters: []
      };
    }
    case 'remove-active-filter': {
      return {
        ...state,
        activeFilters: state.activeFilters.filter(
          f => f.field !== action.data.field
        )
      };
    }
    case 'set-active-filter': {
      return {
        ...state,
        activeFilters: [
          ...state.activeFilters.filter(f => f.field !== action.data.field),
          action.data
        ]
      };
    }
    case 'set-filter-values': {
      const { name, value } = action.data;
      return {
        ...state,
        filterValues: {
          ...state.filterValues,
          [name]: value
        }
      };
    }
    case 'set-sort-by': {
      return {
        ...state,
        sortByValue: action.data
      };
    }
    case 'set-sort-direction': {
      return {
        ...state,
        sortByDirection: action.data
      };
    }
    case 'set-count': {
      return {
        ...state,
        count: action.data
      };
    }
    case 'set-page': {
      return {
        ...state,
        page: action.data
      };
    }
    case 'next-page': {
      return {
        ...state,
        page: state.page + 1
      };
    }
    case 'prev-page': {
      return {
        ...state,
        page: state.page - 1
      };
    }
    default:
      newState = state;
  }
  return newState;
};

export default mailReducer;
