import { useContext, useEffect, useState } from 'react';

import { AlertContext } from '../../app/alert-provider';
import io from 'socket.io-client';

// socket singleton
let SOCKET_INSTANCE = null;
let attempts = 0;

function useSocket({ token, userId }) {
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(SOCKET_INSTANCE);

  const { actions } = useContext(AlertContext);
  const { dismiss, setAlert } = actions;

  function connectSocket() {
    SOCKET_INSTANCE = io(process.env.WEBSOCKET_URL, {
      query: {
        token,
        userId
      }
    });
    console.debug('[socket]: connecting...');
    SOCKET_INSTANCE.on('connect', () => {
      console.debug('[socket]: connected');
      setSocket(socket);
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
  // set up socket on mount
  useEffect(() => {
    if (SOCKET_INSTANCE) {
      return setSocket(SOCKET_INSTANCE);
    } else {
      connectSocket();
    }
  }, []);

  function emit(event, data, cb) {
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
      // save event to queue for later

      return setTimeout(emit.bind(null, event, data, cb), 2000);
    }
    attempts = 0;
    dismiss('connection-warning');
    return SOCKET_INSTANCE.emit(event, data, cb);
  }

  return {
    isConnected: !!socket,
    error,
    emit,
    socket
  };
}

export default useSocket;
