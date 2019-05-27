import React, { createContext, useEffect, useReducer, useState } from 'react';
import db, { useMailSync } from './db';
import mailReducer, { initialState } from './reducer';

const sortByValues = ['date', 'score'];
export const MailContext = createContext({});

export function MailProvider({ children }) {
  const [state, dispatch] = useReducer(mailReducer, initialState);
  const {
    ready,
    fetch,
    unsubscribe,
    resolveUnsubscribeError,
    fetchScores
  } = useMailSync();
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

  async function setFilterValues() {
    db.mail.orderBy('to').uniqueKeys(function(recipients) {
      return dispatch({
        type: 'set-filter-values',
        data: { name: 'recipients', value: recipients }
      });
    });
    db.mail.orderBy('fromEmail').uniqueKeys(emails => {
      fetchScores(emails);
    });
  }

  async function setMailCount(c) {
    let count = c;
    if (!count) {
      count = await db.mail.count();
    }
    return dispatch({ type: 'set-count', data: count });
  }

  function onCreate() {
    debugger;
    // TODO does this change the results of the current active filter?
    setMailCount(state.count + 1);
    setFilterValues();
    // dispatch({ type: 'add', data: obj });
  }
  function onUpdate() {
    // setFilterValues();
    // TODO does this change the details of a currently shown mail item
    // dispatch({ type: 'update', data: obj });
  }
  function onDelete() {
    setMailCount(state.count - 1);
    setFilterValues();
    // TODO does this change the details of a currently shown mail item
    // dispatch({ type: 'update', data: obj });
  }

  useEffect(() => {
    setMailCount();
    setFilterValues();
    db.mail.hook('creating', onCreate);
    db.mail.hook('updating', onUpdate);
    db.mail.hook('deleting', onDelete);
    return () => {
      db.mail.hook('creating').unsubscribe(onCreate);
      db.mail.hook('updating').unsubscribe(onUpdate);
      db.mail.hook('deleting').unsubscribe(onDelete);
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
    refresh: fetch,
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
