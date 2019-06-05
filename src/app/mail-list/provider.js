import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState
} from 'react';
import mailReducer, { initialState } from './reducer';

import { DatabaseContext } from '../db-provider';
import _sortBy from 'lodash.sortby';
import { useMailSync } from './db';

const sortByValues = ['date', 'score'];
export const MailContext = createContext({});

export function MailProvider({ children }) {
  const db = useContext(DatabaseContext);
  const [state, dispatch] = useReducer(mailReducer, initialState);
  const {
    ready,
    fetch,
    unsubscribe,
    resolveUnsubscribeError,
    isFetching
  } = useMailSync();
  const [filteredMail, setFilteredMail] = useState({ count: 0, mail: [] });

  async function filterMail(options) {
    const { activeFilters } = state;
    let filteredCollection = db.mail;
    // apply filters
    if (activeFilters.length) {
      const { values, indexes } = _sortBy(activeFilters, 'field').reduce(
        (out, filter) => {
          const { value, field } = filter;
          return {
            indexes: [...out.indexes, field],
            values: [...out.values, value]
          };
        },
        { values: [], indexes: [] }
      );
      const index = indexes.length > 1 ? `[${indexes.join('+')}]` : indexes[0];
      const value = values.length > 1 ? values : values[0];
      filteredCollection = filteredCollection.where(index).equals(value);
    } else {
      filteredCollection = filteredCollection.toCollection();
    }
    // get total count of all filtered items
    const count = await filteredCollection.count();
    // sort all items
    filteredCollection = await filteredCollection.sortBy(options.orderBy);
    if (options.sortDirection === 'desc') {
      filteredCollection = await filteredCollection.reverse();
    }
    // if sorting by score then move all those
    // without score to the end
    if (options.orderBy === 'score') {
      const { scored, unscored } = filteredCollection.reduce(
        (out, item) => {
          if (item.score === -1) {
            return { ...out, unscored: [...out.unscored, item] };
          }
          return { ...out, scored: [...out.scored, item] };
        },
        { scored: [], unscored: [] }
      );
      filteredCollection = [...scored, ...unscored];
    }

    // filter by pagination
    const startIndex = options.page * options.perPage;
    filteredCollection = await filteredCollection.slice(
      startIndex,
      options.perPage + startIndex
    );

    const filtedMailIds = filteredCollection.map(m => m.id);
    setFilteredMail({
      mail: filtedMailIds,
      count
    });
    return filtedMailIds;
  }

  // when we get new data we check all the filter values
  // and set them again for the filter drop downs
  async function setFilterValues() {
    db.mail.orderBy('to').uniqueKeys(function(recipients) {
      return dispatch({
        type: 'set-filter-values',
        data: { name: 'recipients', value: recipients }
      });
    });
  }

  // setting the mail count will cause the mail list to
  // re-render once
  async function setMailCount(c) {
    let count = c;
    if (!count) {
      count = await db.mail.count();
    }
    return dispatch({ type: 'set-count', data: count });
  }

  // called whenever we get a chunk of emails from the server
  // this is whta triggers a refresh of all the other stuff
  function onCountUpdate(modifications, key) {
    const { value } = modifications;
    if (key === 'totalMail' && value) {
      setTimeout(() => {
        setMailCount(value);
        setFilterValues();
      }, 0);
    }
  }

  // load previous values
  async function loadPreferences() {
    const filters = await db.prefs.get('filters');
    let value = null;
    if (filters) {
      value = filters.value;
    }
    return dispatch({ type: 'init', data: value });
  }

  // run once on mount
  useEffect(() => {
    loadPreferences();
    db.prefs.hook('updating', onCountUpdate);
    return () => {
      db.prefs.hook('updating').unsubscribe(onCountUpdate);
    };
  }, []);

  // when things change, filter the mail list
  useEffect(
    () => {
      if (state.initialized) {
        filterMail({
          orderBy: state.sortByValue,
          sortDirection: state.sortByDirection,
          page: state.page,
          perPage: state.perPage
        });
      }
    },
    [
      state.initialized,
      JSON.stringify(state.activeFilters),
      state.sortByValue,
      state.page,
      state.perPage,
      state.count,
      state.sortByDirection
    ]
  );

  // save filter state to db to use as initial
  // state upon refresh
  useEffect(
    () => {
      if (state.initialized) {
        db.prefs.put({ key: 'filters', value: state });
      }
    },
    [state]
  );

  const value = {
    isLoading: ready && state.initialized,
    page: state.page,
    perPage: state.perPage,
    fetch,
    isFetching,
    filterValues: state.filterValues,
    activeFilters: state.activeFilters,
    mail: filteredMail.mail,
    totalCount: filteredMail.count,
    sortValues: sortByValues,
    sortByValue: state.sortByValue,
    sortByDirection: state.sortByDirection
  };

  return (
    <MailContext.Provider
      value={{
        state: value,
        dispatch,
        actions: { onUnsubscribe: unsubscribe, resolveUnsubscribeError }
      }}
    >
      {children}
    </MailContext.Provider>
  );
}
