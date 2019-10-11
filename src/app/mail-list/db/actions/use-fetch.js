import React, { useCallback } from 'react';

import { AlertContext } from '../../../../providers/alert-provider';
import { DatabaseContext } from '../../../../providers/db-provider';
import { SocketContext } from '../../../../providers/socket-provider';
import { navigate } from 'gatsby';
import { useContext } from 'react';
import useUser from '../../../../utils/hooks/use-user';

export default function() {
  const { checkBuffer, emit } = useContext(SocketContext);
  const db = useContext(DatabaseContext);
  const { actions } = useContext(AlertContext);

  const [{ accountIds, hasAccountProblem }] = useUser(u => ({
    accountIds: u.accounts.map(a => a.id).filter(a => !a.problem),
    hasAccountProblem: u.accounts.some(a => a.problem)
  }));

  const fetch = useCallback(async () => {
    try {
      console.debug('[db]: starting fetch');
      const inProgress = await checkBuffer();
      if (inProgress) {
        console.debug('[db]: fetch is already running');
        return;
      }
      console.debug('[db]: fetching....');
      // clear progress
      db.prefs
        .where('key')
        .equals('progress')
        .delete();

      if (hasAccountProblem) {
        actions.setAlert({
          message: (
            <span>
              There is a problem with one of your accounts. Please visit the
              accounts page to resolve this.
            </span>
          ),
          isDismissable: true,
          autoDismiss: false,
          level: 'warning',
          actions: [
            {
              label: 'Go to accounts',
              onClick: () => {
                navigate('/app/profile/accounts');
              }
            }
          ]
        });
      }
      const pref = await db.prefs.get('lastFetchParams');
      const lastScan = await db.prefs.get('lastFetchResult');
      let fetchParams = {
        accounts: []
      };
      const now = Date.now();
      if (pref && lastScan) {
        const { value: lastFetchParams } = pref;
        const { accounts: lastFetchAccounts } = lastFetchParams;
        // if there are accounts that we haven't searched for yet
        // then do a search on those without a time filter
        const newAccounts = accountIds.filter(
          id => !lastFetchAccounts.map(a => a.id).includes(id)
        );
        console.debug(
          `[db]: fetching mail from ${newAccounts.length} new accounts`
        );
        fetchParams = {
          ...fetchParams,
          accounts: [
            ...fetchParams.accounts,
            ...newAccounts.map(a => ({ id: a }))
          ]
        };

        // if we've done a search before, then fill data up
        // to the present on previously searched accounts
        console.debug(`[db]: fetching new mail on existing accounts`);
        fetchParams = {
          ...fetchParams,
          accounts: [
            ...fetchParams.accounts,
            ...lastFetchAccounts.map(a => ({
              id: a.id,
              from: a.from
            }))
          ]
        };
        // TODO if there are any searches that didn't finish,
        // then fill them
      } else {
        // otherwise fetch all mail on all accounts
        fetchParams = {
          ...fetchParams,
          accounts: accountIds.map(id => ({ id }))
        };
      }
      console.debug('[db]: fetching mail', fetchParams);
      // save the fetch time to prefs, so we know what to search on
      // next time the user visits the page
      await db.prefs.put({
        key: 'lastFetchParams',
        value: {
          ...fetchParams,
          accounts: fetchParams.accounts.map(a => ({
            ...a,
            from: now
          }))
        }
      });
      await db.prefs.delete('lastFetchResult');
      // add the occurrences data if available to the next fetch
      let occurrences = await db.occurrences.orderBy('key').toArray();
      const occurencesFrom = occurrences.map(oc => oc.key.match('<(.*)>')[1]);
      // and add all the mail in the mail list that is not in the
      // occurrences (because that means it's got an occurrence of 1)
      const singleOccurrence = await db.mail
        .where('fromEmail')
        .noneOf(occurencesFrom)
        .toArray();
      occurrences = [
        ...occurrences,
        singleOccurrence.map(so => ({
          count: 1,
          key: `<${so.fromEmail}>-${so.to}`,
          lastSeen: so.date
        }))
      ];
      if (occurrences.length) {
        fetchParams = {
          ...fetchParams,
          occurrences
        };
      }
      return emit('fetch', fetchParams);
    } catch (err) {
      console.error('[db]: failed to fetch mail');
      console.error(err);
    }
  }, [
    accountIds,
    actions,
    checkBuffer,
    db.mail,
    db.occurrences,
    db.prefs,
    emit,
    hasAccountProblem
  ]);

  return fetch;
}
