import { useEffect } from 'react';

export default (socket, db, emit) => {
  useEffect(() => {
    async function onMail(data, ack) {
      console.debug(`[db]: received ${data.length} new mail items`);
      try {
        let mailData = data.map(d => {
          const { email: fromEmail, name: fromName } = parseAddress(d.from);
          let status = d.subscribed ? 'subscribed' : 'unsubscribed';
          if (d.estimatedSuccess === false && !d.resolved) {
            status = 'failed';
          }
          const to = parseAddress(d.to).email;
          return {
            occurrences: [d],
            score: -1,
            to,
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
