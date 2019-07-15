export const initialState = {
  mail: [],
  page: 0,
  count: 0,
  orderBy: 'date',
  perPage: 20,
  filterValues: {
    recipients: []
  },
  options: {
    showSpam: true,
    showTrash: true
  },
  activeFilters: [],
  sortByValue: 'date',
  sortByDirection: 'desc'
};

// mail reducer that represents the internal state
// of indexdb database
const mailReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case 'init': {
      const data = action.data || initialState;
      return {
        initialized: true,
        ...data
      };
    }
    case 'set-show-trash-option': {
      return {
        ...state,
        options: {
          ...state.options,
          showTrash: action.data
        }
      };
    }
    case 'set-show-spam-option': {
      return {
        ...state,
        options: {
          ...state.options,
          showSpam: action.data
        }
      };
    }
    case 'remove-active-filters': {
      return {
        ...state,
        activeFilters: [],
        page: 0
      };
    }
    case 'remove-active-filter': {
      let fields = action.data.fields || [action.data.field];
      return {
        ...state,
        activeFilters: state.activeFilters.filter(
          f => !fields.includes(f.field)
        ),
        page: 0
      };
    }
    case 'replace-active-filter': {
      let { remove, field, type, value } = action.data;
      return {
        ...state,
        activeFilters: [
          ...state.activeFilters.filter(f => !remove.includes(f.field)),
          { field, type, value }
        ],
        page: 0
      };
    }
    case 'set-active-filter': {
      return {
        ...state,
        activeFilters: [
          ...state.activeFilters.filter(f => f.field !== action.data.field),
          action.data
        ],
        page: 0
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
