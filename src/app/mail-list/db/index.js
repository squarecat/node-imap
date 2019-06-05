import { useContext, useEffect, useState } from 'react';

import { AlertContext } from '../../alert-provider';
import { DatabaseContext } from '../../db-provider';
import React from 'react';
import useSocket from '../../../utils/hooks/use-socket';
import useUser from '../../../utils/hooks/use-user';

export function useMailSync() {
  const db = useContext(DatabaseContext);
  const { actions } = useContext(AlertContext);
  const [{ token, id }, { incrementUnsubCount }] = useUser(u => ({
    id: u.id,
    token: u.token
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
            console.debug('[db]: fetching mail scores');
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
                count: occurrences[d]
              }))
            );
          } catch (err) {
            console.error(`[db]: failed setting new occurrences`);
            console.error(err);
          }
        });
        socket.on('mail:err', err => {
          console.error(`[db]: scan failed`);
          console.error(err);
        });
        socket.on('mail:progress', ({ progress, total }, ack) => {
          // const percentage = (progress / total) * 100;
          // setProgress((+percentage).toFixed());
          // console.log(progress, total);
          ack && ack();
        });

        socket.on('unsubscribe:success', async ({ id, data }) => {
          console.debug(`[db]: successfully unsubscribed from ${id}`);
          try {
            const { estimatedSuccess, unsubStrategy, hasImage } = data;
            await db.mail.update(id, {
              isLoading: false,
              estimatedSuccess: estimatedSuccess,
              unsubStrategy: unsubStrategy,
              hasImage: hasImage,
              status: 'unsubscribed'
            });
            const mail = await db.mail.get(id);
            actions.queueAlert({
              message: (
                <span>
                  {`Unsubscribe to ${mail.fromEmail} failed`}
                  {/* <span styleName="from-email-message">{mail.fromEmail}</span>{' '} */}
                  {/* failed. */}
                </span>
              ),
              actions: [
                {
                  label: 'See details',
                  onClick: () => setUnsubData(mail)
                }
              ],
              isDismissable: true,
              level: 'warning'
            });
            incrementUnsubCount();
          } catch (err) {
            console.error(`[db]: failed to set successful unsubscribe`);
            console.error(err);
          }
        });

        socket.on('unsubscribe:err', async ({ id, data }) => {
          console.debug(`[db]: received unsubscribe error`);
          try {
            const { estimatedSuccess, unsubStrategy, hasImage } = data;
            await db.mail.update(id, {
              error: true,
              isLoading: false,
              subscribed: null,
              estimatedSuccess: estimatedSuccess,
              unsubStrategy: unsubStrategy,
              hasImage: hasImage,
              status: 'failed'
            });
            const mail = await db.mail.get(id);
            actions.queueAlert({
              message: (
                <span>
                  {`Unsubscribe to ${mail.fromEmail} failed`}
                  {/* <span styleName="from-email-message">{mail.fromEmail}</span>{' '} */}
                  {/* failed. */}
                </span>
              ),
              actions: [
                {
                  label: 'See details'
                  // onClick: () => setUnsubModal(mail, true)
                }
              ],
              isDismissable: true,
              level: 'warning'
            });
          } catch (err) {
            console.error(`[db]: failed to set failed unsubscribe`);
            console.error(err);
          }
        });
      }
    },
    [isConnected, error]
  );
  return {
    ready: isConnected,
    isFetching,
    unsubData,
    setUnsubData,
    fetch: async () => {
      try {
        setIsFetching(true);
        const latestItem = await db.mail.orderBy('date').last();
        // get latest items
        if (latestItem) {
          const { date: from } = latestItem;
          console.debug(`[db]: fetching mail from ${new Date(from)}`);
          return emit('fetch', { from });
        }
        console.debug('[db]: fetching all mail');
        return emit('fetch');
      } catch (err) {
        console.error('[db]: failed to fetch mail');
        console.error(err);
      }
    },
    unsubscribe: async mailItem => {
      try {
        console.debug(`[db]: unsubscribing from ${mailItem.id}`);
        await db.mail.update(mailItem.id, {
          isLoading: true,
          subscribed: false
        });
        emit('unsubscribe', mailItem);
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
