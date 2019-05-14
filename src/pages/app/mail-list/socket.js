import { useEffect, useReducer, useState } from 'react';

import io from 'socket.io-client';
import useUser from '../../../utils/hooks/use-user';

// socket should sync with the db
function useSocket(callback) {
  const [user, { incrementUnsubCount }] = useUser();
  const preferences = user.preferences || {};

  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [socket, setSocket] = useState(null);
  // only once
  useEffect(() => {
    let socket = io(process.env.WEBSOCKET_URL, {
      query: {
        token: user.token,
        userId: user.id
      }
    });
    console.log('setting up socket');
    socket.on('connect', () => {
      console.log('socket connected');
      setSocket(socket);
    });
    socket.on('error', err => {
      // todo make this better ux
      alert(`socket error: ${err}`);
    });
    socket.on('mail', (data, ack) => {
      setMail(data);
      ack();
    });
    socket.on('mail:end', scan => {
      callback(null, scan);
    });
    socket.on('mail:err', err => {
      console.error(err);
      setError(err);
      callback(err);
    });
    socket.on('mail:progress', ({ progress, total }, ack) => {
      const percentage = (progress / total) * 100;
      setProgress((+percentage).toFixed());
      ack();
    });

    socket.on('unsubscribe:success', ({ id, data }) => {
      console.log('unsub success', data);
      dispatch({ type: 'unsubscribe-success', data: { id, ...data } });
      dispatch({ type: 'set-loading', data: { id, isLoading: false } });
      incrementUnsubCount();
    });
    socket.on('unsubscribe:err', ({ id, data }) => {
      console.error('unsub err', data);
      dispatch({ type: 'unsubscribe-error', data: { id, ...data } });
      dispatch({ type: 'set-loading', data: { id, isLoading: false } });
    });
  }, []);

  function setMail(data) {
    if (_isArray(data)) {
      const filtered = data.filter(d => showMailItem(d));
      dispatch({ type: 'add-all', data: filtered });
    } else {
      if (showMailItem(data)) {
        dispatch({ type: 'add', data });
      }
    }
  }

  function showMailItem(m) {
    if (!preferences.hideUnsubscribedMails) return true;
    if (m.estimatedSuccess === false || m.resolved === false) return true;
    return m.subscribed;
  }

  function fetchMail(timeframe) {
    setProgress(0);
    if (socket) {
      setError(null);
      dispatch({ type: 'clear' });
      console.log('FETCHING', timeframe);
      socket.emit('fetch', { timeframe });
    } else {
      console.log('NO SOCKET', timeframe);
    }
  }
  function unsubscribeMail(mail) {
    if (socket) {
      dispatch({ type: 'unsubscribe', data: mail.id });
      dispatch({ type: 'set-loading', data: { id: mail.id, isLoading: true } });
      socket.emit('unsubscribe', mail);
    }
  }
  function addUnsubscribeErrorResponse(data) {
    console.log('ADD UNSUBSCRIBE ERROR RESPONSE', data);
    if (socket) {
      dispatch({
        type: 'unsubscribe-error-resolved',
        data: { id: data.mailId, success: data.success }
      });
      socket.emit('unsubscribe-error-response', data);
    } else {
      console.log('NO SOCKET', data);
    }
  }

  return {
    mail,
    fetchMail,
    unsubscribeMail,
    isConnected: !!socket,
    addUnsubscribeErrorResponse,
    progress,
    error,
    dispatch
  };
}

export default useSocket;
