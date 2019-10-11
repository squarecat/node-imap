import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { AlertContext } from './alert-provider';
import { DatabaseContext } from './db-provider';
import { getSocketError } from '../utils/errors';
import io from 'socket.io-client';
import useUser from '../utils/hooks/use-user';

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [{ token, userId }] = useUser(u => ({
    userId: u.id,
    token: u.token
  }));
  const db = useContext(DatabaseContext);
  const { actions } = useContext(AlertContext);
  const { dismiss, setAlert } = actions;
  const attemptsRef = useRef(0);
  // set up socket on mount
  const { socket, error } = useSocket(token, userId);

  const emit = useCallback(
    (event, data, cb) => {
      const attempts = attemptsRef.current;
      if (!socket || socket.disconnected) {
        console.warn(
          `[socket]: no socket to emit event "${event}", waiting for socket to open`
        );
        console.warn('[socket]: ', socket);
        if (attempts > 1) {
          setAlert({
            id: 'connection-warning',
            level: 'warning',
            message: 'Connection lost. Trying to reconnect...',
            isDismissable: false,
            autoDismiss: false
          });
        }
        attemptsRef.current = attempts + 1;
        if (attempts > 2) {
          // save event to queue for later
          return db.queue.put({
            event,
            data
          });
        }
        console.log(`[socket]: pending emit ${event}`);
        return setTimeout(emit.bind(this, event, data, cb), 2000);
      }
      attemptsRef.current = 0;
      dismiss('connection-warning');
      console.log(`[socket]: emit ${event}`);

      return socket.emit(event, data, cb);
    },
    [db.queue, dismiss, setAlert, socket]
  );

  const checkBuffer = useCallback(() => {
    return new Promise(resolve => {
      console.log('[socket]: checking buffer');
      // if we are reconnecting then the server might
      // have a buffer of events waiting for us
      // now we're all setup we can request these.
      emit('request-buffer', {}, scanInProgress => {
        if (scanInProgress) {
          console.log('[socket]: remote scan in progress');
        }
        // after we've received the buffer then we
        // are fully ready, the server will tell us
        // if there is already a scan in progress
        resolve(scanInProgress);
      });
    });
  }, [emit]);

  useEffect(() => {
    async function checkQueue() {
      const queue = await db.queue.toArray();
      if (queue.length) {
        await db.queue.clear();
        queue.forEach(({ data, event, cb }) => emit(event, data, cb));
      }
    }
    if (socket && !socket.disconnected) {
      // check queue and fire pending events
      checkQueue();
    }
  }, [db.queue, emit, socket]);

  useEffect(() => {
    if (socket) {
      socket.on('reconnect', attemptNumber => {
        console.debug(`[socket]: reconnect ${attemptNumber}`);
        checkBuffer();
      });
    }
  }, [socket, checkBuffer]);

  const value = useMemo(
    () => ({
      isConnected: !!socket,
      error,
      emit,
      socket,
      checkBuffer
    }),
    [checkBuffer, emit, error, socket]
  );

  return (
    <SocketContext.Provider value={value}>
      {value.socket ? children : null}
    </SocketContext.Provider>
  );
}

SocketProvider.whyDidYouRender = true;

function useSocket(token, userId) {
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);

  useMemo(() => {
    const sock = io(process.env.WEBSOCKET_URL, {
      query: {
        token,
        userId
      }
    });
    console.debug('[socket]: connecting...');
    sock.on('connect', async () => {
      console.debug('[socket]: connected');
      setSocket(sock);
    });
    sock.on('error', (err = {}) => {
      console.debug('[socket]: errored');
      console.debug(err);
      if (err && err.reason === 'not-authorized') {
        window.location.href = `/login?error=true&reason=${err.reason}`;
        return false;
      }
      const message = getSocketError(err);
      setError(message);
    });
    sock.on('disconnect', () => {
      console.debug('[socket]: disconnected');
      setSocket(null);
    });

    return () => {
      sock.off('error');
      sock.off('disconnect');
      sock.off('connect');
    };
  }, [token, userId]);
  return { socket, error };
}

useSocket.whyDidYouRender = true;
