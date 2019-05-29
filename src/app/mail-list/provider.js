import React, { createContext, useEffect, useReducer, useState } from 'react';
import db, { useMailSync } from './db';
import mailReducer, { initialState } from './reducer';

const sortByValues = ['date', 'score'];
export const MailContext = createContext({});

export function MailProvider({ children }) {
  const [state, dispatch] = useReducer(mailReducer, initialState);
  const { ready, fetch, unsubscribe, resolveUnsubscribeError } = useMailSync();
  const [filteredMail, setFilteredMail] = useState({ count: 0, mail: [] });

  async function filterMail(options) {
    const { activeFilters } = state;
    let filteredCollection = db.mail;
    // apply filters
    if (activeFilters.length) {
      filteredCollection = activeFilters.reduce((col, filter, i) => {
        const { field, value, type } = filter;
        if (i === 0) {
          return col.where(field)[type](value);
        }
        return col.or(field)[type](value);
      }, db.mail);
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

  useEffect(() => {
    setFilterValues();
    db.counts.hook('updating', onCountUpdate);
    return () => {
      db.counts.hook('updating').unsubscribe(onCountUpdate);
    };
  }, []);

  useEffect(
    () => {
      filterMail({
        orderBy: state.sortByValue,
        sortDirection: state.sortByDirection,
        page: state.page,
        perPage: state.perPage
      });
    },
    [
      JSON.stringify(state.activeFilters),
      state.sortByValue,
      state.page,
      state.perPage,
      state.count,
      state.sortByDirection
    ]
  );

  const value = {
    isLoading: ready,
    page: state.page,
    perPage: state.perPage,
    fetch,
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
