import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
  useState
} from 'react';
import mailReducer, { initialState } from './reducer';

import { DatabaseContext } from '../../providers/db-provider';
import _sortBy from 'lodash.sortby';
import useMailSocket from './db';

const sortByValues = ['lastSeenDate', 'score.score', 'occurrenceCount'];
export const MailContext = createContext({});

export const MailProvider = function({ children }) {
  const db = useContext(DatabaseContext);
  const { actions } = useMailSocket();
  const [state, dispatch] = useReducer(mailReducer, initialState);
  const [isLoading, setLoading] = useState(true);
  const [filteredMail, setFilteredMail] = useState({
    count: 0,
    mail: [],
    loaded: false
  });

  // when we get new data we check all the filter values
  // and set them again for the filter drop downs
  const setFilterValues = useCallback(async () => {
    db.mail
      .orderBy('[to+forAccount+provider]')
      .uniqueKeys(function(recipients) {
        if (
          recipients.sort().join('') !==
          state.filterValues.recipients.sort().join('')
        ) {
          return dispatch({
            type: 'set-filter-values',
            data: {
              name: 'recipients',
              value: recipients
            }
          });
        }
      });
  }, [db.mail, state.filterValues.recipients]);

  // run once on mount
  useEffect(() => {
    // load previous values
    async function loadPreferences() {
      const filters = await db.prefs.get('filters');
      let value = null;
      if (filters) {
        value = filters.value;
      }
      return dispatch({ type: 'init', data: value });
    }
    loadPreferences();
  }, [db.prefs]);

  useEffect(() => {
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
    function onCountUpdate(modifications, key, obj, transaction) {
      const { value } = modifications;
      if (key === 'totalMail' && value) {
        transaction.on('complete', () => {
          setMailCount(value);
          setFilterValues();
        });
      }
    }
    function onCountCreate(key, obj, transaction) {
      return onCountUpdate(obj, key, obj, transaction);
    }

    db.prefs.hook('creating', onCountCreate);
    db.prefs.hook('updating', onCountUpdate);
    return () => {
      db.prefs.hook('creating').unsubscribe(onCountCreate);
      db.prefs.hook('updating').unsubscribe(onCountUpdate);
    };
  }, [db.mail, db.prefs, setFilterValues]);

  // when things change, filter the mail list
  useEffect(() => {
    const filter = async () => {
      const { mail, unseenSenders, count } = await filterMail(
        state.activeFilters,
        db,
        {
          orderBy: state.sortByValue,
          sortDirection: state.sortByDirection,
          page: state.page,
          perPage: state.perPage,
          ...state.options
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
        actions.setOccurrencesSeen({ senders: unseenSenders });
      }
      if (isLoading) {
        setLoading(true);
      }
    };
    if (state.initialized) {
      filter();
    }
  }, [
    state.initialized,
    state.activeFilters,
    state.sortByValue,
    state.page,
    state.perPage,
    state.count,
    state.sortByDirection,
    state.options,
    db,
    filteredMail,
    actions,
    isLoading
  ]);

  // save filter state to db to use as initial
  // state upon refresh
  useEffect(() => {
    if (state.initialized) {
      db.prefs.put({ key: 'filters', value: state });
    }
  }, [db.prefs, state]);

  const value = useMemo(
    () => ({
      isLoading,
      page: state.page,
      perPage: state.perPage,
      fetch,
      filterValues: state.filterValues,
      activeFilters: state.activeFilters,
      mail: filteredMail.mail,
      totalCount: filteredMail.count,
      sortValues: sortByValues,
      sortByValue: state.sortByValue,
      sortByDirection: state.sortByDirection,
      options: state.options
    }),
    [
      isLoading,
      state.page,
      state.perPage,
      state.filterValues,
      state.activeFilters,
      state.sortByValue,
      state.sortByDirection,
      state.options,
      filteredMail.mail,
      filteredMail.count
    ]
  );

  const context = useMemo(() => {
    return {
      state: value,
      actions,
      dispatch
    };
  }, [actions, value]);

  return (
    <MailContext.Provider value={context}>{children}</MailContext.Provider>
  );
};

MailProvider.whyDidYouRender = true;

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
  if (options.orderBy === 'score.score') {
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

  // filter options
  if (!options.showSpam) {
    filteredCollection = filteredCollection.filter(f => !f.isSpam);
  }
  if (!options.showTrash) {
    filteredCollection = filteredCollection.filter(f => !f.isTrash);
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
