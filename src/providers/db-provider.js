import React, { createContext } from 'react';

import Dexie from 'dexie';

export const DatabaseContext = createContext(null);

const db = new Dexie('leavemealone');

db.version(1).stores({
  mail: `&id, fromEmail, date, *labels, score, to, status, [status+to], forAccount, [to+forAccount+provider]`,
  scores: `&address, score`,
  occurrences: `key, count`,
  prefs: `key`,
  queue: '++id'
});
db.open();

export const DatabaseProvider = ({ children }) => {
  db.clear = ({ account } = {}) => {
    if (account) {
      // clear emails associated with
      // a specific account
      return db.mail
        .where('forAccount')
        .equals(account)
        .delete();
    }
    return Promise.all([
      db.mail.clear(),
      db.scores.clear(),
      db.occurrences.clear(),
      db.prefs.clear()
    ]);
  };
  return (
    <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>
  );
};
