import React, { useEffect, useReducer, useState } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { useGlobal } from '../../utils/hooks';
import ErrorModal from '../../components/error-modal';
import Toggle from '../../components/toggle';

import io from 'socket.io-client';

import './mail-list.css';
import useLocalStorage from '../../utils/hooks/use-localstorage';

const mailReducer = (state = [], action) => {
  switch (action.type) {
    case 'add':
      return [...state, { ...action.data }];
    case 'unsubscribe':
      return state.map(email =>
        email.id === action.data ? { ...email, subscribed: null } : email
      );
    case 'unsubscribe-success':
      return state.map(email =>
        email.id === action.data.id
          ? {
              ...email,
              subscribed: false,
              error: false,
              image: action.data.image,
              estimatedSuccess: action.data.estimatedSuccess
            }
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
    case 'unsubscribe-error-resolved':
      return state.map(email =>
        email.id === action.data.id
          ? {
              ...email,
              error: false,
              subscribed: false,
              estimatedSuccess: true
            }
          : email
      );
    case 'clear': {
      return [];
    }
    default:
      return state;
  }
};

function useSocket(callback) {
  const [user] = useGlobal('user');

  const [localMail, setLocalMail] = useLocalStorage('leavemealone.mail', []);
  const [mail, dispatch] = useReducer(mailReducer, localMail);

  useEffect(
    () => {
      setLocalMail(mail);
    },
    [mail]
  );
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
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
      setError(err);
    });
    socket.on('mail:progress', ({ progress, total }) => {
      const percentage = (progress / total) * 100;
      setProgress((+percentage).toFixed());
    });

    socket.on('unsubscribe:success', ({ id, data }) => {
      console.log('unsub success', data);
      dispatch({ type: 'unsubscribe-success', data: { id, ...data } });
    });
    socket.on('unsubscribe:err', ({ id, data }) => {
      console.log('unsub err', data);
      dispatch({ type: 'unsubscribe-error', data: { id, ...data } });
    });
  }, []);

  function fetchMail(timeframe) {
    setProgress(0);
    if (socket) {
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
      socket.emit('unsubscribe', mail);
    }
  }
  function addUnsubscribeErrorResponse(data) {
    console.log('ADD UNSUBSCRIBE ERROR RESPONSE', data);
    if (socket) {
      dispatch({
        type: 'unsubscribe-error-resolved',
        data: { id: data.mailId }
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

export default ({ onFinished, hasSearched, timeframe, showPriceModal }) => {
  const [isSearchFinished, setSearchFinished] = useState(false);

  const {
    mail,
    fetchMail,
    unsubscribeMail,
    isConnected,
    addUnsubscribeErrorResponse,
    progress,
    error
  } = useSocket(() => {
    setSearchFinished(true);
    onFinished();
  });

  useEffect(() => {
    localStorage.setItem('leavemealone.hasbeenwelcomed', true);
  }, []);

  useEffect(
    () => {
      if (timeframe && hasSearched) {
        setSearchFinished(false);
        fetchMail(timeframe);
      }
    },
    [timeframe]
  );

  useEffect(
    () => {
      if (!hasSearched) {
        setSearchFinished(false);
        fetchMail(timeframe);
      } else {
        setSearchFinished(true);
      }
    },
    [isConnected]
  );

  // because the count is estimated, the progress can go above 100%
  // so here we make it more believable
  const believableProgress = progress > 95 ? 98 : progress;
  return (
    <>
      <div className={`mail-actions ${isSearchFinished ? 'finished' : ''}`}>
        <span className="results-data">
          <span className="quantity">{mail ? mail.length : 0}</span>
          subscriptions found
        </span>
        <span className="progress">{`Scanning... ${
          isSearchFinished ? 100 : believableProgress
        }%`}</span>
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
      {error ? (
        <ErrorScreen error={error} />
      ) : (
        <List
          mail={mail || []}
          onUnsubscribe={mail => unsubscribeMail(mail)}
          isSearchFinished={isSearchFinished}
          showPriceModal={showPriceModal}
          addUnsubscribeErrorResponse={addUnsubscribeErrorResponse}
        />
      )}
    </>
  );
};

function ErrorScreen({ error }) {
  if (error === 'Error: Invalid Credentials') {
    return (
      <div className="mail-error">
        <p>
          Oh no, it looks like your Google credentials have become invalid
          somehow, perhaps you revoked your token?
        </p>

        <a className="btn centered muted">Retry</a>

        <p>
          If this keeps happening please try{' '}
          <a href="/auth/logout">logging out</a> and back in again to refresh
          your credentials. Thanks!
        </p>
        <pre className="error-details">{error}</pre>
      </div>
    );
  }
  return (
    <div className="mail-error">
      {/* <h3>Oops</h3> */}
      <p>Oh no, something went wrong on our end. Please try and scan again</p>

      <a className="btn centered muted">Retry</a>

      <p>
        This is definitely our fault, so if it still doesn't work then please
        bear with us and we'll try and get it sorted for you!
      </p>
      <pre className="error-details">{error}</pre>
    </div>
  );
}

function List({
  mail = [],
  onUnsubscribe,
  isSearchFinished,
  showPriceModal,
  addUnsubscribeErrorResponse
}) {
  const [unsubscribeError, setUnsubscribeError] = useState(null);
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
      <TransitionGroup component="ul">
        {mail.map(m => {
          const isSubscibed = !!m.subscribed;
          console.log(m);
          const [, fromName, fromEmail] = /^(.*)(<.*>)/.exec(m.from);
          return (
            <CSSTransition key={m.id} timeout={500} classNames="mail-list-item">
              <li className="mail-list-item">
                <div className="mail-item">
                  <div className="avatar" />
                  <div className="from">
                    <span className="from-name">{fromName}</span>
                    <span className="from-email">{fromEmail}</span>
                  </div>
                  <div className="subject">{m.subject}</div>
                  <div className="actions">
                    {m.estimatedSuccess !== false ? (
                      <Toggle
                        status={isSubscibed}
                        onChange={() => onUnsubscribe(m)}
                      />
                    ) : (
                      <svg
                        onClick={() => setUnsubscribeError(m)}
                        className="failed-to-unsub-btn"
                        viewBox="0 0 32 32"
                        width="20"
                        height="20"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                      >
                        <path d="M16 14 L16 23 M16 8 L16 10" />
                        <circle cx="16" cy="16" r="14" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="unsubscribe">{m.unsubscribeLink}</span>
                <span className="unsubscribe">{m.unsubscribeMailTo}</span>
              </li>
            </CSSTransition>
          );
        })}
      </TransitionGroup>
      {unsubscribeError ? (
        <ErrorModal
          onClose={() => setUnsubscribeError(null)}
          onSubmit={({ success, useImage, failReason = null }) => {
            setUnsubscribeError(null);
            addUnsubscribeErrorResponse({
              success,
              mailId: unsubscribeError.id,
              image: useImage ? unsubscribeError.image : null,
              from: unsubscribeError.from,
              reason: failReason
            });
          }}
          image={unsubscribeError.image}
          link={unsubscribeError.unsubscribeLink}
        />
      ) : null}
    </div>
  );
}
