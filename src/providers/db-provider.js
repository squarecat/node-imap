import React, { createContext } from 'react';

import Dexie from 'dexie';

export const DatabaseContext = createContext(null);

const db = new Dexie('leavemealone');

db.version(1).stores({
  mail: `&id, fromEmail, date, *labels, score, to, status, [status+to], [forAccount+status], forAccount, [to+forAccount+provider]`,
  scores: `&address, score`,
  occurrences: `key, count`,
  prefs: `key`,
  queue: '++id'
});

// version 2 combines occurrences into the mail
// table, and provides the ability to sort by
// mail occurrence
db.version(2)
  .stores({
    mail: `&id, key, fromEmail, lastSeenDate, *labels, score.score, to, status, [status+to], [forAccount+status], forAccount, [to+forAccount+provider], occurrenceCount`,
    prefs: `key`,
    queue: '++id'
  })
  .upgrade(tx => {
    return Promise.all([
      tx.mail.clear(),
      tx.scores.clear(),
      tx.occurrences.clear(),
      tx.prefs.clear(),
      tx.queue.clear()
    ]);
  })
  .catch(err => {
    console.error(err);
  });

db.open();

export const DatabaseProvider = ({ children }) => {
  db.clear = async ({ email, id } = {}) => {
    if (email) {
      // clear last searched prefs
      const lastSearch = await db.prefs.get('lastFetchParams');
      const filters = await db.prefs.get('filters');
      if (lastSearch) {
        const { value } = lastSearch;
        const newValue = {
          ...value,
          accounts: value.accounts.filter(() => id !== id)
        };
        await db.prefs.put({ key: 'lastFetchParams', value: newValue });
      }
      if (filters) {
        const { value } = filters;
        const { filterValues } = value;
        const { recipients } = filterValues;
        const newRecipients = recipients.filter(
          ([, account]) => account !== email
        );
        await db.prefs.put({
          key: 'filters',
          value: {
            ...value,
            filterValues: {
              ...filterValues,
              recipients: newRecipients
            }
          }
        });
      }
      // clear emails associated with
      // a specific account
      return db.mail
        .where('forAccount')
        .equals(email)
        .delete();
    }
    return Promise.all([
      db.mail.clear(),
      db.scores.clear(),
      db.occurrences.clear(),
      db.prefs.delete('lastFetchParams'),
      db.prefs.delete('lastFetchResult'),
      db.prefs.delete('progress'),
      db.prefs.delete('filters'),
      db.prefs.delete('totalMail')
    ]);
  };

  if (db.verno === 1) {
    // migrate some data that wasn't stored correctly
    db.mail
      .where('status')
      .equals('unsubscribed')
      .modify(m => {
        if (!m.estimatedSuccess && !m.resolved) {
          m.status = 'failed';
        }
      });
  }
  return (
    <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>
  );
};
