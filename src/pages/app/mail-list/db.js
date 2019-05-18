import Dexie from 'dexie';
import { useEffect } from 'react';
import useSocket from './socket';
import useUser from '../../../utils/hooks/use-user';

const db = new Dexie('leavemealone');

db.version(1).stores({
  mail: `&id, date, *labels, to`
});
db.open();
export default db;

export function useMailSync() {
  const [{ token, id }, { incrementUnsubCount }] = useUser(u => ({
    id: u.id,
    token: u.token
  }));
  const { isConnected, socket, error } = useSocket({ token, userId: id });

  useEffect(
    () => {
      if (isConnected) {
        socket.on('mail', async (data, ack) => {
          try {
            console.log(data);
            await db.mail.bulkPut(
              data.map(d => ({ ...d, to: parseAddress(d.to).email }))
            );
          } catch (err) {
            console.error(err);
          }
          ack();
        });
        socket.on('mail:end', scan => {
          console.log(scan);
        });
        socket.on('mail:err', err => {
          console.error(err);
        });
        socket.on('mail:progress', ({ progress, total }, ack) => {
          // const percentage = (progress / total) * 100;
          // setProgress((+percentage).toFixed());
          console.log(progress, total);
          ack();
        });

        socket.on('unsubscribe:success', async ({ id, data }) => {
          try {
            console.log('unsub success', id, data);
            await db.mail.put(data, id);
            incrementUnsubCount();
          } catch (err) {
            console.error(err);
          }
        });
        socket.on('unsubscribe:err', ({ id, data }) => {
          console.error('unsub err', data, id);
        });
      }
    },
    [isConnected, error]
  );
  return {
    ready: isConnected,
    fetch: async () => {
      await db.mail.clear();
      console.log('refreshing mail');
      // fixme, no timeframes
      socket.emit('fetch', { timeframe: '3d' });
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
