import { useEffect, useState } from 'react';

import io from 'socket.io-client';

// socket singleton
let SOCKET_INSTANCE = null;
let socketConnecting = null;
let socketDisconnected = false;

function useSocket({ token, userId }) {
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(SOCKET_INSTANCE);

  function connectSocket() {
    socketConnecting = new Promise((resolve, reject) => {
      let socket = io(process.env.WEBSOCKET_URL, {
        query: {
          token,
          userId
        }
      });
      console.debug('[socket]: connecting...');

      socket.on('connect', () => {
        console.debug('[socket]: connected');
        socketDisconnected = false;
        setSocket(socket);
        resolve();
      });
      socket.on('error', err => {
        console.error('[socket]: errored');
        setError(err);
        reject(err);
      });
      socket.on('disconnect', () => {
        console.debug('[socket]: disconnected');
        socketDisconnected = true;
        setSocket(null);
        SOCKET_INSTANCE = null;
      });
      SOCKET_INSTANCE = socket;
    });
  }
  // set up socket on mount
  useEffect(() => {
    if (socketConnecting) {
      socketConnecting.then(() => {
        return setSocket(SOCKET_INSTANCE);
      });
    } else {
      connectSocket();
    }
  }, []);

  // if socket dies for some reason then
  // reinitialize it
  useEffect(
    () => {
      if (socket === null && socketDisconnected) {
        connectSocket();
      }
    },
    [socket]
  );

  function emit(event, data, cb) {
    if (!SOCKET_INSTANCE) {
      console.warn(
        `no socket to emit event "${event}", waiting for socket to open`
      );
      return setTimeout(emit.bind(this, event, data, cb), 1000);
    }
    return SOCKET_INSTANCE.emit(event, data, cb);
  }

  return {
    socket,
    isConnected: !!socket,
    error,
    emit
  };
}

export default useSocket;
