import { useEffect, useState } from 'react';

import io from 'socket.io-client';

// socket singleton
let SOCKET_INSTANCE = null;
let socketConnecting = null;
// socket should sync with the db
function useSocket({ token, userId }) {
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(SOCKET_INSTANCE);
  const [connectionPromise, setConnectionPromise] = useState(
    new Promise(() => {})
  );
  // only once
  useEffect(() => {
    if (socketConnecting) {
      socketConnecting.then(() => {
        return setSocket(SOCKET_INSTANCE);
      });
    } else {
      socketConnecting = new Promise((resolve, reject) => {
        let socket = io(process.env.WEBSOCKET_URL, {
          query: {
            token,
            userId
          }
        });
        console.log('setting up socket');

        socket.on('connect', () => {
          console.log('socket connected');
          setSocket(socket);
          resolve();
        });
        socket.on('error', err => {
          console.log('socket errored');
          setError(err);
          reject(err);
        });
        socket.on('disconnect', () => {
          console.log('socket disconnected');
          setSocket(null);
          SOCKET_INSTANCE = null;
        });
        SOCKET_INSTANCE = socket;
      });
    }
  }, []);

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
    socketReady: connectionPromise,
    error,
    emit
  };
}

export default useSocket;

// function fetchMail(timeframe) {
//   setProgress(0);
//   if (socket) {
//     setError(null);
//     dispatch({ type: 'clear' });
//     console.log('FETCHING', timeframe);
//     socket.emit('fetch', { timeframe });
//   } else {
//     console.log('NO SOCKET', timeframe);
//   }
// }
// function unsubscribeMail(mail) {
//   if (socket) {
//     dispatch({ type: 'unsubscribe', data: mail.id });
//     dispatch({ type: 'set-loading', data: { id: mail.id, isLoading: true } });
//     socket.emit('unsubscribe', mail);
//   }
// }
// function addUnsubscribeErrorResponse(data) {
//   console.log('ADD UNSUBSCRIBE ERROR RESPONSE', data);
//   if (socket) {
//     dispatch({
//       type: 'unsubscribe-error-resolved',
//       data: { id: data.mailId, success: data.success }
//     });
//     socket.emit('unsubscribe-error-response', data);
//   } else {
//     console.log('NO SOCKET', data);
//   }
// }
