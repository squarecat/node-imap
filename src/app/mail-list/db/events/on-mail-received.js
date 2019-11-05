import { useEffect, useCallback } from 'react';

export default (socket, db) => {
  const onMail = useCallback(
    async function onMail(data, ack) {
      console.debug(`[db]: received ${data.length} new mail items`);
      try {
        const { newSubscriptions = [], duplicateSubscriptions = [] } = data;
        let mailData = newSubscriptions.map(d => {
          const { email: fromEmail, name: fromName } = parseAddress(d.from);
          let status = d.subscribed ? 'subscribed' : 'unsubscribed';
          if (d.estimatedSuccess === false && !d.resolved) {
            status = 'failed';
          }
          const to = parseAddress(d.to).email;
          const mail = d;
          return {
            key: mail.key,
            id: mail.key,
            forAccount: mail.forAccount,
            provider: mail.provider,
            from: mail.from,
            to: to,
            unsubscribeLink: mail.unsubscribeLink,
            unsubscribeMailTo: mail.unsubscribeMailTo,
            unsubStrategy: mail.unsubStrategy,
            estimatedSuccess: mail.estimatedSuccess,
            resolved: mail.resolved,
            hasImage: mail.hasImage,
            isTrash: mail.isTrash,
            isSpam: mail.isSpam,
            score: mail.score || {
              score: -1,
              rank: null,
              unsubscribeRate: 0
            },
            subscribed: mail.subscribed,
            fromEmail: fromEmail,
            fromName: fromName,
            isLoading: false,
            error: false,
            status,
            occurrenceCount: 1,
            lastSeenDate: mail.date,
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

        db.transaction('rw', ['mail', 'prefs'], async () => {
          await db.mail.bulkPut(mailData);

          if (duplicateSubscriptions.length) {
            await db.mail
              .where('key')
              .anyOf(duplicateSubscriptions.map(ds => ds.key))
              .modify(item => {
                const mails = duplicateSubscriptions.filter(
                  ds => ds.key === item.key
                );
                const newOccurrences = Object.values(
                  [...item.occurrences, ...mails].reduce((out, m) => {
                    return {
                      ...out,
                      [m.date]: m
                    };
                  }, {})
                );

                item.occurrences = newOccurrences.sort(
                  (a, b) => b.date - a.date
                );
                console.log('[fetcher]: adding new occ');
                item.occurrenceCount = newOccurrences.length;
              });
          }
          const count = await db.mail.count();
          await db.prefs.put({ key: 'totalMail', value: count });
        });
      } catch (err) {
        console.error(`[db]: failed setting new mail items`);
        console.error(err);
      } finally {
        ack && ack();
      }
    },
    [db]
  );

  const onEnd = useCallback(
    async function onEnd(scan, ack) {
      console.debug(`[db]: finished scan`);
      try {
        console.log('[db]: saving scan time');
        await db.prefs.put({
          key: 'lastFetchResult',
          value: { ...scan, finishedAt: Date.now() }
        });
      } catch (err) {
        console.error(`[db]: failed finishing scan`);
        console.error(err);
      } finally {
        ack && ack();
      }
    },
    [db.prefs]
  );

  useEffect(() => {
    if (socket) {
      socket.on('mail:end', onEnd);
      socket.on('mail', onMail);
    }
    return () => {
      if (socket) {
        socket.off('mail');
        socket.off('mail:end');
      }
    };
  }, [socket, onEnd, onMail]);

  return {
    onMail,
    onEnd
  };
};

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
