import React, { createContext, useEffect, useReducer } from 'react';
import mailReducer, { initialState } from './reducer';

import Dexie from 'dexie';
import useSocket from './socket';
import useUser from '../../../utils/hooks/use-user';

const db = new Dexie('leavemealone');
db.version(1).stores({
  mail: `id`
});

export const MailContext = createContext({});

export function MailProvider({ children }) {
  const [state, dispatch] = useReducer(mailReducer, initialState);
  const { ready, fetch } = useMail();

  useEffect(
    () => {
      if (ready) {
        fetch();
      }
    },
    [ready]
  );

  const value = {
    mail: state.mail
  };
  return <MailContext.Provider value={value}>{children}</MailContext.Provider>;
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
          debugger;
          // await db.tasks.bulkPut(
          //   { date: Date.now(), description: 'Test Dexie bulkPut()', done: 1 },
          // ]);
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

        socket.on('unsubscribe:success', ({ id, data }) => {
          console.log('unsub success', id, data);
          incrementUnsubCount();
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
    fetch: () => {
      // fixme, no timeframes
      socket.emit('fetch', { timeframe: '3d' });
    }
  };
}
