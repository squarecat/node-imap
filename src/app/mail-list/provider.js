import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState
} from 'react';
import mailReducer, { initialState } from './reducer';

import { DatabaseContext } from '../../providers/db-provider';
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
    isFetching,
    unsubData,
    setUnsubData,
    setOccurrencesSeen
  } = useMailSync();
  const [filteredMail, setFilteredMail] = useState({ count: 0, mail: [] });

  // when we get new data we check all the filter values
  // and set them again for the filter drop downs
  async function setFilterValues() {
    db.mail
      .orderBy('[to+forAccount+provider]')
      .uniqueKeys(function(recipients) {
        return dispatch({
          type: 'set-filter-values',
          data: {
            name: 'recipients',
            value: recipients
          }
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
      const filter = async () => {
        const { mail, unseenSenders, count } = await filterMail(
          state.activeFilters,
          db,
          {
            orderBy: state.sortByValue,
            sortDirection: state.sortByDirection,
            page: state.page,
            perPage: state.perPage
          }
        );
        // if it's diferent then set
        if (
          count !== filteredMail.count ||
          mail.join() !== filteredMail.mail.join()
        ) {
          setFilteredMail({ count, mail });
        }
        // if there are unseenSenders then emit
        if (unseenSenders.length) {
          setOccurrencesSeen({ senders: unseenSenders });
        }
      };
      if (state.initialized) {
        filter();
      }
    },
    [
      state.initialized,
      state.activeFilters,
      state.sortByValue,
      state.page,
      state.perPage,
      state.count,
      state.sortByDirection,
      db,
      setOccurrencesSeen,
      filteredMail
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
    [db.prefs, state]
  );

  const value = {
    isLoading: !ready || !state.initialized,
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
    sortByDirection: state.sortByDirection,
    unsubData
  };

  return (
    <MailContext.Provider
      value={{
        state: value,
        dispatch,
        actions: {
          onUnsubscribe: unsubscribe,
          resolveUnsubscribeError,
          setUnsubData
        }
      }}
    >
      {children}
    </MailContext.Provider>
  );
}

async function filterMail(activeFilters, db, options) {
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
  const unseenSenders = Object.keys(
    filteredCollection.reduce((out, m) => {
      if (!m.seen) {
        return {
          ...out,
          [m.fromEmail]: 1
        };
      }
      return out;
    }, {})
  );

  return {
    mail: filtedMailIds,
    unseenSenders,
    count
  };
}

MailProvider.whyDidYouRender = true;
