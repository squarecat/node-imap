import React, { useEffect, useReducer, useState } from 'react';
import Toggle from '../../components/toggle';
import { useGlobal } from 'reactn';
import io from 'socket.io-client';

import './mail-list.css';

const mailReducer = (state, action) => {
  switch (action.type) {
    case 'add':
      return [...state, action.data];
    case 'unsubscribe':
      return state.map(email =>
        email.id === action.data ? { ...email, subscribed: null } : email
      );
    case 'unsubscribe-success':
      return state.map(email =>
        email.id === action.data.id
          ? { ...email, subscribed: false, image: action.data.image }
          : email
      );
    case 'unsubscribe-error':
      return state.map(email =>
        email.id === action.data.id
          ? {
              ...email,
              error: true,
              subscribed: null,
              image: action.data.image
            }
          : email
      );
    default:
      return state;
  }
};

function useSocket(callback) {
  const [user] = useGlobal('user');
  const [mail, dispatch] = useReducer(
    mailReducer,
    JSON.parse(localStorage.getItem('leavemealone.mail')) || []
  );
  useEffect(
    () => {
      localStorage.setItem('leavemealone.mail', JSON.stringify(mail));
    },
    [mail]
  );
  // const [isConnected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  // only once
  useEffect(() => {
    const socket = io.connect('http://127.0.0.1:2345/mail');
    console.log('setting up socket');
    socket.on('connect', () => {
      console.log('socket connected');
      socket.emit('authenticate', { token: user.token, userId: user.id });
    });
    socket.on('authenticated', () => {
      console.log('socket authenticated');
      setSocket(socket);
    });
    socket.on('mail', data => {
      console.log(data);
      dispatch({ type: 'add', data: data });
    });
    socket.on('mail:end', callback);
    socket.on('mail:err', err => {
      console.error(err);
    });

    socket.on('unsubscribe:success', ({ id, data }) => {
      dispatch({ type: 'unsubscribe-success', data: { id, ...data } });
    });
    socket.on('unsubscribe:err', ({ id, data }) => {
      dispatch({ type: 'unsubscribe-error', data: { id, ...data } });
    });
  }, []);

  function fetchMail(timeframe) {
    if (socket) {
      console.log('FETCHING', timeframe);
      socket.emit('fetch', { timeframe });
    } else {
      console.log('NO SOCKET', timeframe);
    }
  }
  function unsubscribeMail(mail) {
    if (socket) {
      dispatch({ type: 'unsubscribe', data: mail.id });
      socket.emit('unsubscribe', mail);
    }
  }

  return { mail, fetchMail, unsubscribeMail, isConnected: !!socket, dispatch };
}

export default ({ onFinished, hasSearched, timeframe, showPriceModal }) => {
  const [isSearchFinished, setSearchFinished] = useState(false);

  const { mail, fetchMail, unsubscribeMail, isConnected } = useSocket(() => {
    setSearchFinished(true);
    onFinished();
  });

  useEffect(() => {
    localStorage.setItem('leavemealone.hasbeenwelcomed', true);
  }, []);

  useEffect(
    () => {
      if (timeframe && hasSearched) {
        fetchMail(timeframe);
      }
    },
    [timeframe]
  );

  useEffect(
    () => {
      if (!hasSearched) {
        fetchMail(timeframe);
      } else {
        setSearchFinished(true);
      }
    },
    [isConnected]
  );

  return (
    <>
      <div className="mail-actions">
        {/* {mail.length ? ( */}
        <span className="results-data">
          <span className="quantity">{mail.length}</span>
          subscribtions found
        </span>
        {/* ) : null} */}

        <a onClick={() => showPriceModal()} className="btn compact icon">
          <svg
            viewBox="0 0 32 32"
            width="14"
            height="14"
            fill="none"
            stroke="currentcolor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          >
            <path d="M29 16 C29 22 24 29 16 29 8 29 3 22 3 16 3 10 8 3 16 3 21 3 25 6 27 9 M20 10 L27 9 28 2" />
          </svg>
          Re-scan
        </a>
      </div>
      <List
        mail={mail}
        onUnsubscribe={mail => unsubscribeMail(mail)}
        isSearchFinished={isSearchFinished}
        showPriceModal={showPriceModal}
      />
    </>
  );
};

function List({ mail, onUnsubscribe, isSearchFinished, showPriceModal }) {
  if (!mail.length && isSearchFinished) {
    return (
      <div className="mail-empty-state">
        <h3>No mail subscriptions found! 🎉</h3>
        <p>Enjoy your clear inbox!</p>
        <p>
          If you're still getting subscription emails then try searching{' '}
          <a onClick={showPriceModal}>over a longer period</a>.
        </p>
      </div>
    );
  }
  return (
    <div className="mail-list">
      <ul>
        {mail.map(m => {
          const [, fromName, fromEmail] = /^(.*)(<.*>)/.exec(m.from);
          return (
            <li key={m.from}>
              <div className="mail-item">
                <div className="avatar" />
                <div className="mail-content">
                  <div className="from">
                    <span className="from-name">{fromName}</span>
                    <span className="from-email">{fromEmail}</span>
                  </div>
                  <div className="subject">{m.subject}</div>
                </div>
                <div className="actions">
                  <Toggle status={'on'} />
                  {/* <a onClick={() => onUnsubscribe(m)}>Unsubscribe</a> */}
                </div>
              </div>
              {/* <span className="unsubscribe">{m.unsubscribeLink}</span>
              <span className="unsubscribe">{m.unsubscribeMailTo}</span> */}
              <span className="image">
                {m.image ? (
                  <img
                    alt="unsub image"
                    src={`data:image/jpeg;base64, ${m.image}`}
                  />
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
