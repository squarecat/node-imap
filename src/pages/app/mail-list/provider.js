import React, { createContext, useEffect, useReducer, useState } from 'react';
import db, { useMailSync } from './db';
import mailReducer, { initialState } from './reducer';

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
    console.log('filtering mail');
    const { activeFilters } = state;
    let filteredCollection = db.mail;
    if (activeFilters.length) {
      filteredCollection = activeFilters.reduce((col, filter, i) => {
        const { field, value, type } = filter;
        if (i === 0) {
          return col.where(field)[type](value);
        }
        return col.or(field)[type](value);
      }, db.mail);
    }

    const count = await filteredCollection.count();
    filteredCollection = await filteredCollection
      .offset(options.page * options.perPage)
      .limit(options.perPage)
      .reverse()
      .sortBy(options.orderBy);

    const filtedMailIds = filteredCollection.map(m => m.id);
    setFilteredMail({
      mail: filtedMailIds,
      count
    });

    fetchScores(filteredCollection.map(m => m.fromEmail));
    return filtedMailIds;
  }

  async function setFilterValues() {
    db.mail.orderBy('to').uniqueKeys(function(recipients) {
      return dispatch({
        type: 'set-filter-values',
        data: { name: 'recipients', value: recipients }
      });
    });
  }

  async function setMailCount(c) {
    let count = c;
    if (!count) {
      count = await db.mail.count();
    }
    return dispatch({ type: 'set-count', data: count });
  }

  function onCreate(key, obj) {
    // TODO does this change the results of the current active filter?
    setMailCount(state.count + 1);
    setFilterValues();
    // dispatch({ type: 'add', data: obj });
  }
  function onUpdate(modifications, key, obj) {
    setFilterValues();
    // TODO does this change the details of a currently shown mail item
    // dispatch({ type: 'update', data: obj });
  }
  function onDelete(modifications, key, obj) {
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
        orderBy: state.orderBy,
        page: state.page,
        perPage: state.perPage
      });
    },
    [
      JSON.stringify(state.activeFilters),
      state.orderBy,
      state.page,
      state.perPage,
      state.count
    ]
  );

  const value = {
    isLoading: ready,
    page: state.page,
    perPage: state.perPage,
    orderBy: state.orderBy,
    refresh: fetch,
    filterValues: state.filterValues,
    activeFilters: state.activeFilters,
    mail: filteredMail.mail,
    totalCount: filteredMail.count
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
