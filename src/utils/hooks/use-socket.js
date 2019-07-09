import { useCallback, useContext, useEffect, useState } from 'react';

import { AlertContext } from '../../providers/alert-provider';
import { DatabaseContext } from '../../providers/db-provider';
import io from 'socket.io-client';

// socket singleton
let SOCKET_INSTANCE = null;
let attempts = 0;

function useSocket({ token, userId }) {
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(SOCKET_INSTANCE);
  const db = useContext(DatabaseContext);
  const { actions } = useContext(AlertContext);
  const { dismiss, setAlert } = actions;

  const emit = useCallback(
    (event, data, cb) => {
      if (!SOCKET_INSTANCE || SOCKET_INSTANCE.disconnected) {
        console.warn(
          `no socket to emit event "${event}", waiting for socket to open`
        );
        if (attempts > 1) {
          setAlert({
            id: 'connection-warning',
            level: 'warning',
            message: 'Connection lost. Trying to reconnect...',
            isDismissable: false,
            autoDismiss: false
          });
        }
        attempts = attempts + 1;
        if (attempts > 2) {
          // save event to queue for later
          return db.queue.put({
            event,
            data
          });
        }
        return setTimeout(emit.bind(null, event, data, cb), 2000);
      }
      attempts = 0;
      dismiss('connection-warning');
      return SOCKET_INSTANCE.emit(event, data, cb);
    },
    [socket]
  );
  // set up socket on mount
  useEffect(
    () => {
      function connectSocket() {
        SOCKET_INSTANCE = io(process.env.WEBSOCKET_URL, {
          query: {
            token,
            userId
          }
        });
        console.debug('[socket]: connecting...');
        const socket = SOCKET_INSTANCE.on('connect', async () => {
          console.debug('[socket]: connected');
          setSocket(socket);
          // check queue and fire pending events
          const queue = await db.queue.toArray();
          if (queue.length) {
            await db.queue.clear();
            queue.forEach(({ data, event }) => emit(event, data));
          }
        });
        SOCKET_INSTANCE.on('error', err => {
          console.error('[socket]: errored');
          setError(err);
        });
        SOCKET_INSTANCE.on('disconnect', () => {
          console.debug('[socket]: disconnected');
          setSocket(null);
        });
      }

      if (SOCKET_INSTANCE) {
        return setSocket(SOCKET_INSTANCE);
      } else {
        connectSocket();
      }
    },
    [token, userId]
  );

  return {
    isConnected: !!socket,
    error,
    emit,
    socket
  };
}

export default useSocket;
