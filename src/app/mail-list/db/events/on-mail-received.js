import { useEffect } from 'react';

export default (socket, db, emit) => {
  useEffect(() => {
    async function onMail(data, ack) {
      console.debug(`[db]: received ${data.length} new mail items`);
      try {
        const { newSubscriptions, duplicateSubscriptions } = data;
        let mailData = newSubscriptions.map(d => {
          const { email: fromEmail, name: fromName } = parseAddress(d.from);
          let status = d.subscribed ? 'subscribed' : 'unsubscribed';
          if (d.estimatedSuccess === false && !d.resolved) {
            status = 'failed';
          }
          const to = parseAddress(d.to).email;
          const mail = d;
          return {
            forAccount: mail.forAccount,
            provider: mail.provider,
            id: mail.id,
            from: mail.from,
            to: to,
            unsubscribeLink: mail.unsubscribeLink,
            unsubscribeMailTo: mail.unsubscribeMailTo,
            isTrash: mail.isTrash,
            isSpam: mail.isSpam,
            score: -1,
            subscribed: mail.subscribed,
            fromEmail: fromEmail,
            fromName: fromName,
            isLoading: false,
            error: false,
            status,
            occurrenceCount: 1,
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

        db.transaction('rw', 'mail', async () => {
          await db.mail.bulkPut(mailData);
          await db.mail
            .where('key')
            .anyOf(duplicateSubscriptions.map(ds => ds.key))
            .modify(item => {
              const { mail } = duplicateSubscriptions.find(
                ds => ds.key === item.key
              );
              const newOccurrences = [...item.occurrences, ...mail];
              item.occurrences = newOccurrences;
              item.occurrenceCount = newOccurrences.length;
            });
          const count = await db.mail.count();
          await db.prefs.put({ key: 'totalMail', value: count });
        });

        const senders = mailData.map(md => md.fromEmail);
        emit('fetch-scores', { senders });
      } catch (err) {
        console.error(`[db]: failed setting new mail items`);
        console.error(err);
      } finally {
        ack && ack();
      }
    }
    async function onEnd(scan, ack) {
      console.debug(`[db]: finished scan`);
      try {
        const { occurrences } = scan;

        await db.occurrences.bulkPut(
          Object.keys(occurrences).map(d => ({
            key: d,
            ...occurrences[d]
          }))
        );
        console.log('[db]: saving scan time');
        await db.prefs.put({
          key: 'lastFetchResult',
          value: { ...scan, finishedAt: Date.now() }
        });
      } catch (err) {
        console.error(`[db]: failed setting new occurrences`);
        console.error(err);
      } finally {
        ack && ack();
      }
    }

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
  }, [socket, db, emit]);
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
