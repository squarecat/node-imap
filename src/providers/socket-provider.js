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
  const [{ token, userId, browserId }] = useUser(u => ({
    userId: u.id,
    token: u.token,
    browserId: u.browserId
  }));
  const db = useContext(DatabaseContext);
  const { actions } = useContext(AlertContext);
  const { dismiss, setAlert } = actions;
  // set up socket on mount
  const { socket, error, connected } = useSocket(token, userId, browserId);

  const emit = useCallback(
    (event, data, cb) => {
      if (!socket || (!connected && !socket.connected)) {
        console.warn(
          `[socket]: no socket to emit event "${event}", waiting for socket to open`
        );
        console.warn('[socket]: ', socket, connected);
        setAlert({
          id: 'connection-warning',
          level: 'warning',
          message: 'Connection lost. Trying to reconnect...',
          isDismissable: false,
          autoDismiss: false
        });
        return db.queue.put({
          event,
          data
        });
      }
      dismiss('connection-warning');
      console.log(`[socket]: emit ${event}`);

      return socket.emit(event, data, cb);
    },
    [connected, db.queue, dismiss, setAlert, socket]
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
    const reconnect = attemptNumber => {
      console.debug(`[socket]: reconnect ${attemptNumber}`);
      dismiss('connection-warning');
      checkBuffer();
    };
    if (socket) {
      socket.on('reconnect', reconnect);
    }
    return () => {
      if (socket) {
        socket.on('reconnect', reconnect);
      }
    };
  }, [socket, checkBuffer, dismiss]);

  const value = useMemo(
    () => ({
      isConnected: connected,
      error,
      emit,
      socket,
      checkBuffer
    }),
    [checkBuffer, connected, emit, error, socket]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

function useSocket(token, userId, browserId) {
  const [state, setState] = useState({
    socket: null,
    connected: false,
    error: null
  });

  useEffect(() => {
    let sock;
    if (browserId) {
      sock = io(process.env.WEBSOCKET_URL, {
        query: {
          token,
          userId,
          browserId
        }
      });
      console.debug('[socket]: connecting...');
      sock.on('connect', async () => {
        console.debug('[socket]: connected');
        setState({ error: null, socket: sock, connected: true });
      });
      sock.on('error', (err = {}) => {
        console.debug('[socket]: errored');
        console.debug(err);
        if (err && err.reason === 'not-authorized') {
          window.location.href = `/login?error=true&reason=${err.reason}`;
          return false;
        }
        const message = getSocketError(err);
        setState({ socket: sock, error: message, connected: false });
      });
      sock.on('disconnect', () => {
        console.debug('[socket]: disconnected');
        setState({ socket: sock, error: null, connected: false });
      });
    }

    return () => {
      if (sock) {
        sock.off('error');
        sock.off('disconnect');
        sock.off('connect');
        sock.disconnect();
      }
    };
  }, [browserId, token, userId]);

  return state;
}
