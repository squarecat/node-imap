import { useEffect, useState } from 'react';

import Dexie from 'dexie';
import useSocket from './socket';
import useUser from '../../../utils/hooks/use-user';

const db = new Dexie('leavemealone');

db.version(1).stores({
  mail: `&id, date, *labels, to`,
  scores: `&address`
});
db.open();

export function useMailSync() {
  const [{ token, id }, { incrementUnsubCount }] = useUser(u => ({
    id: u.id,
    token: u.token
  }));
  const { isConnected, socket, error, socketReady } = useSocket({
    token,
    userId: id
  });

  useEffect(
    () => {
      if (isConnected) {
        socket.on('mail', async (data, ack) => {
          try {
            console.log(data);
            await db.mail.bulkPut(
              data.map(d => {
                const { email: fromEmail, name: fromName } = parseAddress(
                  d.from
                );
                return {
                  ...d,
                  to: parseAddress(d.to).email,
                  fromEmail,
                  fromName,
                  isLoading: false,
                  error: false
                };
              })
            );
          } catch (err) {
            console.error(err);
          }
          ack();
        });
        socket.on('scores', async (data, ack) => {
          try {
            console.log(data);
            await db.scores.bulkPut(
              data.map(d => ({
                address: d.address,
                score: d.score,
                rank: d.rank
              }))
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
            await db.mail.update(id, {
              isLoading: false,
              estimatedSuccess: data.estimatedSuccess,
              unsubStrategy: data.unsubStrategy,
              hasImage: data.hasImage
            });
            incrementUnsubCount();
          } catch (err) {
            console.error(err);
          }
        });

        socket.on('unsubscribe:err', async ({ id, data }) => {
          console.error('unsub err', data, id);
          await db.mail.update(id, {
            error: true,
            isLoading: false,
            subscribed: null,
            estimatedSuccess: data.estimatedSuccess,
            unsubStrategy: data.unsubStrategy,
            hasImage: data.hasImage
          });
        });
      }
    },
    [isConnected, error]
  );
  return {
    ready: isConnected,
    fetchScores: async senders => {
      console.log('fetching mail scores');
      await socketReady;
      socket.emit('fetch-scores', { senders });
    },
    fetch: async () => {
      await db.mail.clear();
      console.log('refreshing mail');
      await socketReady;
      socket.emit('fetch');
    },
    unsubscribe: async mailItem => {
      await db.mail.update(mailItem.id, { isLoading: true, subscribed: false });
      await socketReady;
      socket.emit('unsubscribe', mailItem);
    },
    resolveUnsubscribeError: async data => {
      await db.mail.update(data.mailId, {
        error: false,
        subscribed: false,
        estimatedSuccess: data.success,
        resolved: true
      });
      await socketReady;
      socket.emit('unsubscribe-error-response', data);
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

export function useScore(address) {
  const [score, setScore] = useState('unknown');
  function onUpdate(modifications, key, obj) {
    if (key === address) {
      const newItem = { ...obj, ...modifications };
      setScore({ score: newItem.score, rank: newItem.rank });
    }
  }
  function onCreate(key, obj) {
    if (key === address) {
      setScore({ score: obj.score, rank: obj.rank });
    }
  }
  async function get() {
    const value = await db.scores.get(address);
    if (value) {
      setScore({ score: value.score, rank: value.rank });
    }
  }
  useEffect(() => {
    db.mail.hook('updating', onUpdate);
    db.mail.hook('creating', onCreate);
    get();
    return () => {
      db.mail.hook('updating').unsubscribe(onUpdate);
      db.mail.hook('creating').unsubscribe(onCreate);
    };
  }, []);
  return score;
}

export function useMailItem(id, reducer = v => v) {
  const [item, setItem] = useState({});
  function onUpdate(modifications, key, obj) {
    if (key === id) {
      const newItem = { ...obj, ...modifications };
      setItem(reducer(newItem));
    }
  }
  async function get() {
    const value = await db.mail.get(id);
    setItem(reducer(value));
  }
  useEffect(
    () => {
      db.mail.hook('updating', onUpdate);
      get();
      return () => {
        db.mail.hook('updating').unsubscribe(onUpdate);
      };
    },
    [id]
  );
  return item;
}

export default db;
