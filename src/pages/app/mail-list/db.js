import React, { createContext, useEffect, useReducer, useState } from 'react';
import mailReducer, { initialState } from './reducer';

import Dexie from 'dexie';
import useSocket from './socket';
import useUser from '../../../utils/hooks/use-user';

const db = new Dexie('leavemealone');
db.version(1).stores({
  mail: `&id, *labels, to`
});

export const MailContext = createContext({});

export function MailProvider({ children }) {
  const [state, dispatch] = useReducer(mailReducer, initialState);
  const { ready, fetch } = useMail();

  function create(key, obj) {
    dispatch({ type: 'add', data: obj });
  }
  function update(modifications, key, obj) {
    dispatch({ type: 'update', data: obj });
  }

  useEffect(
    () => {
      if (ready) {
        fetch();
      }
    },
    [ready]
  );

  useEffect(() => {
    db.mail.hook('creating', create);
    db.mail.hook('updating', update);

    return () => {
      db.mail.hook('creating').unsubscribe(create);
      db.mail.hook('updating').unsubscribe(update);
    };
  }, []);

  const value = {
    mail: state.mail
  };
  return <MailContext.Provider value={value}>{children}</MailContext.Provider>;
}

export const MailItemContext = createContext({});

export function MailItemProvider({ id, children }) {
  const [item, setItem] = useState({});

  async function fetchItem() {
    console.log('fetching', id, 'from db');
    const value = await db.mail.get(id);
    setItem(value);
  }

  useEffect(
    () => {
      fetchItem();
    },
    [id]
  );

  return (
    <MailItemContext.Provider value={item}>{children}</MailItemContext.Provider>
  );
}

function useMail() {
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
            await db.mail.bulkPut(data);
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
