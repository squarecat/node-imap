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
    let updated = 0;
    console.log('upgrade: started db upgrade');
    tx.occurrences
      .toArray()
      .then(occurrences => {
        return tx.mail.toCollection().modify(function(mail) {
          const key = `<${mail.fromEmail}>-${mail.to}`;
          const occ = occurrences.find(o => o.key === key);
          updated++;
          this.value = {
            key,
            forAccount: mail.forAccount,
            provider: mail.provider,
            id: mail.id,
            from: mail.from,
            to: mail.to,
            unsubscribeLink: mail.unsubscribeLink,
            unsubscribeMailTo: mail.unsubscribeMailTo,
            isTrash: mail.isTrash,
            isSpam: mail.isSpam,
            score: mail.score,
            subscribed: mail.subscribed,
            fromEmail: mail.fromEmail,
            fromName: mail.fromName,
            isLoading: mail.isLoading,
            error: mail.error,
            status: mail.status,
            occurrenceCount: occ ? occ.count : 1,
            lastSeenDate: mail.date,
            __migratedFrom: 'v1',
            occurrences: [
              {
                subject: mail.subject,
                snippet: mail.snippet,
                date: mail.date,
                id: mail.id
              }
            ]
          };
        });
      })
      .then(() => {
        console.log(`updated ${updated} records`);
        tx.delete('occurrences');
      })
      .catch(err => {
        console.error(err);
      });
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
      db.prefs.clear()
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
