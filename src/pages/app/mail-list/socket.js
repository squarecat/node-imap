import { useEffect, useState } from 'react';

import io from 'socket.io-client';

// socket singleton
let SOCKET_INSTANCE;

// socket should sync with the db
function useSocket({ token, userId }) {
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [connectionPromise, setConnectionPromise] = useState(
    new Promise(() => {})
  );
  // only once
  useEffect(() => {
    if (SOCKET_INSTANCE) {
      return setSocket(SOCKET_INSTANCE);
    }
    let socket = io(process.env.WEBSOCKET_URL, {
      query: {
        token,
        userId
      }
    });
    console.log('setting up socket');
    setConnectionPromise(
      new Promise((resolve, reject) => {
        socket.on('connect', () => {
          setSocket(socket);
          resolve();
        });
        socket.on('error', err => {
          setError(err);
          reject('failed to connect');
        });
        socket.on('disconnect', () => {
          setSocket(null);
          SOCKET_INSTANCE = null;
        });
      })
    );
    SOCKET_INSTANCE = socket;
  }, []);

  return {
    socket,
    isConnected: !!socket,
    socketReady: connectionPromise,
    error
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
