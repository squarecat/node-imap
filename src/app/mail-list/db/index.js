import { useContext, useEffect, useState } from 'react';

import { AlertContext } from '../../../providers/alert-provider';
import { DatabaseContext } from '../../../providers/db-provider';
import { ModalContext } from '../../../providers/modal-provider';
import React from 'react';
import { getUnsubscribeAlert } from '../../../utils/errors';
import { navigate } from 'gatsby';
import useSocket from '../../../utils/hooks/use-socket';
import useUser from '../../../utils/hooks/use-user';

export function useMailSync() {
  const db = useContext(DatabaseContext);
  const { actions } = useContext(AlertContext);
  const { open: openModal } = useContext(ModalContext);
  const [
    {
      token,
      id,
      credits,
      organisationId,
      organisationActive,
      accountIds,
      hasAccountProblem,
      preferences
    },
    { incrementUnsubCount, addUnsub }
  ] = useUser(u => ({
    id: u.id,
    token: u.token,
    credits: u.billing ? u.billing.credits : 0,
    organisationId: u.organisationId,
    organisationActive: u.organisationActive,
    accountIds: u.accounts.map(a => a.id).filter(a => !a.problem),
    hasAccountProblem: u.accounts.some(a => a.problem),
    preferences: u.preferences
  }));
  const { isConnected, socket, error, emit } = useSocket({
    token,
    userId: id
  });
  const [unsubData, setUnsubData] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(
    () => {
      if (isConnected) {
        socket.on('mail', async (data, ack) => {
          console.debug(`[db]: received ${data.length} new mail items`);
          try {
            const mailData = data.map(d => {
              const { email: fromEmail, name: fromName } = parseAddress(d.from);
              let status = d.subscribed ? 'subscribed' : 'unsubscribed';
              if (d.estimatedSuccess === false && !d.resolved) {
                status = 'failed';
              }
              return {
                ...d,
                score: -1,
                to: parseAddress(d.to).email,
                fromEmail,
                fromName,
                isLoading: false,
                error: false,
                status
              };
            });
            await db.mail.bulkPut(mailData);
            const count = await db.mail.count();
            await db.prefs.put({ key: 'totalMail', value: count });
            const senders = mailData.map(md => md.fromEmail);
            emit('fetch-scores', { senders });
          } catch (err) {
            console.error(`[db]: failed setting new mail items`);
            console.error(err);
          }
          ack && ack();
        });
        socket.on('scores', async data => {
          console.debug(`[db]: received ${data.length} new mail scores`);
          try {
            await db.scores.bulkPut(
              data.map(d => ({
                address: d.address,
                score: d.score,
                rank: d.rank,
                unsubscribePercentage: d.unsubscribePercentage,
                senderScore: d.senderScore
              }))
            );
            await data.reduce(async (p, d) => {
              await p;
              return db.mail
                .where('fromEmail')
                .equals(d.address)
                .modify({ score: d.score });
            }, Promise.resolve());
          } catch (err) {
            console.error(`[db]: failed setting new mail scores`);
            console.error(err);
          }
        });
        socket.on('mail:end', async scan => {
          console.debug(`[db]: finished scan`);
          setIsFetching(false);
          try {
            const { occurrences } = scan;
            await db.occurrences.bulkPut(
              Object.keys(occurrences).map(d => ({
                key: d,
                ...occurrences[d]
              }))
            );
            await db.prefs.put({
              key: 'lastFetchResult',
              value: { ...scan, finishedAt: Date.now() }
            });
          } catch (err) {
            console.error(`[db]: failed setting new occurrences`);
            console.error(err);
          }
        });
        socket.on('mail:err', err => {
          console.error(`[db]: scan failed`);
          actions.setAlert({
            message: <span>{`Failed to fetch mail. Code: ${err.id}`}</span>,
            isDismissable: true,
            autoDismiss: false,
            level: 'error'
          });
        });
        socket.on('mail:progress', ({ progress, total }, ack) => {
          // const percentage = (progress / total) * 100;
          // setProgress((+percentage).toFixed());
          // console.debug(progress, total);
          ack && ack();
        });

        socket.on('unsubscribe:success', async ({ id, data }) => {
          console.debug(`[db]: successfully unsubscribed from ${id}`);
          try {
            const { estimatedSuccess, unsubStrategy, hasImage } = data;
            let update = {
              estimatedSuccess,
              unsubStrategy,
              hasImage,
              isLoading: false,
              status: estimatedSuccess ? 'unsubscribed' : 'failed'
            };
            if (unsubStrategy === 'mailto') {
              const { emailStatus, emailData } = data;
              update = {
                ...update,
                emailStatus,
                emailData
              };
            }
            addUnsub(data);
            await db.mail.update(id, update);
            const mail = await db.mail.get(id);
            if (!estimatedSuccess) {
              actions.queueAlert({
                message: (
                  <span>{`Unsubscribe to ${mail.fromEmail} failed`}</span>
                ),
                actions: [
                  {
                    label: 'See details',
                    onClick: () => {
                      // defensive code against an old bug where unsubStrategy can be null
                      let strat = mail.unsubStrategy;
                      if (!strat) {
                        strat = mail.unsubscribeLink ? 'link' : 'mailto';
                      }
                      setUnsubData({ ...mail, unsubStrategy: strat });
                    }
                  }
                ],
                isDismissable: true,
                level: 'warning'
              });
            }
            incrementUnsubCount();
          } catch (err) {
            console.error(`[db]: failed to set successful unsubscribe`);
            console.error(err);
          }
        });

        socket.on('unsubscribe:err', async ({ id, err }) => {
          console.debug(`[db]: received unsubscribe error`);
          try {
            // incrementCredits(1);
            const { data } = err;

            const mail = await db.mail.get(id);
            const alert = getUnsubscribeAlert({
              id: err.id,
              reason: data.errKey,
              mail,
              alertActions: actions,
              modalActions: { openModal },
              credits
            });

            await db.mail.update(id, {
              isLoading: false,
              subscribed: true,
              status: 'failed'
            });
            actions.queueAlert(alert);
          } catch (err) {
            console.error(`[db]: failed to set failed unsubscribe`);
            console.error(err);
          }
        });
      }
      return () => {
        if (socket) {
          socket.off('mail');
          socket.off('scores');
          socket.off('mail:end');
          socket.off('mail:err');
          socket.off('mail:progress');
          socket.off('unsubscribe:success');
          socket.off('unsubscribe:err');
        }
      };
    },
    [isConnected, error]
  );
  return {
    ready: isConnected,
    isFetching,
    unsubData,
    setUnsubData,
    setOccurrencesSeen: async ({ senders }) => {
      if (preferences.occurrencesConsent) {
        await db.mail
          .where('fromEmail')
          .anyOf(senders)
          .modify({ seen: true });
        emit('occurrences', senders);
      }
    },
    fetch: async () => {
      try {
        setIsFetching(true);
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
        db.prefs.put({
          key: 'lastFetchParams',
          value: {
            ...fetchParams,
            accounts: fetchParams.accounts.map(a => ({ ...a, from: now }))
          }
        });
        await db.prefs.delete('lastFetchResult');
        return emit('fetch', fetchParams);
      } catch (err) {
        console.error('[db]: failed to fetch mail');
        console.error(err);
      }
    },
    unsubscribe: async mailItem => {
      try {
        console.debug(`[db]: unsubscribing from ${mailItem.id}`);

        const { allowed, reason } = canUnsubscribe({
          credits,
          organisationId,
          organisationActive
        });
        if (!allowed) {
          const alert = getUnsubscribeAlert({
            reason,
            mail: mailItem,
            alertActions: actions,
            modalActions: { openModal },
            credits
          });
          actions.setAlert(alert);
          return false;
        }
        await db.mail.update(mailItem.id, {
          isLoading: true,
          subscribed: false
        });
        emit('unsubscribe', mailItem);
        return true;
      } catch (err) {
        console.error('[db]: failed to unsubscribe mail');
        console.error(err);
      }
    },
    resolveUnsubscribeError: async data => {
      try {
        console.debug(`[db]: resolving unsubscribe error from ${data.mailId}`);
        await db.mail.update(data.mailId, {
          error: false,
          subscribed: false,
          estimatedSuccess: data.success,
          resolved: true
        });
        emit('unsubscribe-error-response', data);
      } catch (err) {
        console.error('[db]: failed to resolve unsubscribe error');
        console.error(err);
      }
    }
  };
}

function parseAddress(str = '') {
  if (!str) {
    return { name: '', email: '' };
  }
  let name;
  let email;
  if (str.match(/^.*<.*>/)) {
    const [, nameMatch, emailMatch] = /^(.*)<(.*)>/.exec(str);
    name = nameMatch;
    email = emailMatch;
  } else if (str.match(/<?.*@/)) {
    const [, nameMatch] = /<?(.*)@/.exec(str);
    name = nameMatch || str;
    email = str;
  } else {
    name = str;
    email = str;
  }
  return { name, email: email.toLowerCase() };
}

function canUnsubscribe({ credits, organisationId, organisationActive }) {
  if (organisationId && !organisationActive) {
    console.debug('[db]: unsubscribe failed - organisation inactive');
    return {
      allowed: false,
      reason: 'organisation-inactive'
    };
  } else if (!organisationId && credits <= 0) {
    console.debug('[db]: unsubscribe failed - insufficient credits');
    return {
      allowed: false,
      reason: 'insufficient-credits'
    };
  }
  return { allowed: true };
}
