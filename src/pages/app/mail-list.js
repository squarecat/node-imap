import React, { useEffect, useReducer, useState } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import ErrorBoundary from '../../components/error-boundary';
import { useGlobal } from '../../utils/hooks';
import UnsubModal from '../../components/unsub-modal';
import Toggle from '../../components/toggle';

import format from 'date-fns/format';
import io from 'socket.io-client';

const mailDateFormat = 'Do MMM YYYY HH:mm';

import './mail-list.css';
import useLocalStorage from '../../utils/hooks/use-localstorage';

const mailReducer = (state = [], action) => {
  switch (action.type) {
    case 'add':
      return [
        ...state,
        { ...action.data, error: !action.data.estimatedSuccess }
      ];
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
              estimatedSuccess: action.data.estimatedSuccess,
              unsubStrategy: action.data.unsubStrategy
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
              image: action.data.image,
              estimatedSuccess: action.data.estimatedSuccess,
              unsubStrategy: action.data.unsubStrategy
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
    case 'set-loading': {
      return state.map(email =>
        email.id === action.data.id
          ? { ...email, isLoading: action.data.isLoading }
          : email
      );
    }
    default:
      return state;
  }
};

function useSocket(callback) {
  const [user] = useGlobal('user');

  // gatsby wont compile without these type checks
  const [localMail, setLocalMail] = useLocalStorage(
    `leavemealone.mail.${user ? user.id : ''}`,
    []
  );

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
    let socket;
    if (window.location.host.startsWith('local')) {
      socket = io.connect('http://127.0.0.1:2345/mail');
    } else {
      socket = io.connect('https://leavemealone.xyz/mail');
    }
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
      callback(err);
    });
    socket.on('mail:progress', ({ progress, total }) => {
      const percentage = (progress / total) * 100;
      setProgress((+percentage).toFixed());
    });

    socket.on('unsubscribe:success', ({ id, data }) => {
      console.log('unsub success', data);
      dispatch({ type: 'unsubscribe-success', data: { id, ...data } });
      dispatch({ type: 'set-loading', data: { id, isLoading: false } });
    });
    socket.on('unsubscribe:err', ({ id, data }) => {
      console.error('unsub err', data);
      dispatch({ type: 'unsubscribe-error', data: { id, ...data } });
      dispatch({ type: 'set-loading', data: { id, isLoading: false } });
    });
  }, []);

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

export default ({ timeframe, showPriceModal }) => {
  const [isSearchFinished, setSearchFinished] = useState(false);
  const [user, setUser] = useGlobal('user');
  const { hasSearched } = user || {};
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
  });

  function doSearch() {
    setSearchFinished(false);
    fetchMail(timeframe);
  }

  useEffect(
    () => {
      if (timeframe && hasSearched) {
        doSearch();
      }
    },
    [timeframe]
  );

  useEffect(
    () => {
      if (!hasSearched) {
        if (isConnected) {
          doSearch();
          setUser({ ...user, hasSearched: true });
        }
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
        <span className="action-item results-data">
          <span className="quantity">{mail ? mail.length : 0}</span>
          subscriptions found
        </span>
        <span className="action-item progress">{`Scanning... ${
          isSearchFinished ? 100 : believableProgress
        }%`}</span>
        <span className="action-item">
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
        </span>
      </div>
      {error ? (
        <ErrorScreen error={error} retry={doSearch} />
      ) : (
        <ErrorBoundary>
          <List
            mail={mail || []}
            onUnsubscribe={mail => unsubscribeMail(mail)}
            isSearchFinished={isSearchFinished}
            showPriceModal={showPriceModal}
            addUnsubscribeErrorResponse={addUnsubscribeErrorResponse}
          />
        </ErrorBoundary>
      )}
      {isSearchFinished ? RevokeTokenInstructions() : null}
    </>
  );
};

function ErrorScreen({ error, retry }) {
  if (error === 'Error: Invalid Credentials') {
    return (
      <div className="mail-error">
        <p>
          Oh no, it looks like your Google credentials have become invalid
          somehow, perhaps you revoked your token?
        </p>

        <a className="btn centered muted" onClick={retry}>
          Retry
        </a>

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
      <p>Oh no, something went wrong on our end. Please try and scan again</p>

      <a className="btn centered muted" onClick={retry}>
        Retry
      </a>

      <p>
        This is definitely our fault, so if it still doesn't work then please
        bear with us and we'll try and get it sorted for you!
      </p>
      <pre className="error-details">{error}</pre>
    </div>
  );
}

function RevokeTokenInstructions() {
  return (
    <div className="revoke-token-instructions">
      <p>
        You can revoke access to Leave Me Alone any time by visiting your{' '}
        <a
          href="https://security.google.com/settings/security/permissions"
          target="_blank"
          rel="noopener noreferrer"
          className="revoke-link"
        >
          Google Account Settings
          <svg
            className="icon-external"
            viewBox="0 0 32 32"
            width="14"
            height="14"
            fill="none"
            stroke="currentcolor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          >
            <path d="M14 9 L3 9 3 29 23 29 23 18 M18 4 L28 4 28 14 M28 4 L14 18" />
          </svg>
        </a>
        .
        <span className="revoke-warning">
          <strong>WARNING</strong>: if you revoke your token you will need to
          log-in again before you can perform any more scans.
        </span>
      </p>
    </div>
  );
}

const progressTweets = [
  {
    val: -1,
    text: `Start unsubscribing to take back control of your inbox from spammers! 💌`,
    tweet: `I’m using @LeaveMeAloneApp to take back control of my inbox and unsubscribe from email lists with one click! 💌 leavemealone.xyz`
  },
  {
    val: 1,
    text: `Congrats! You’ve unsubscribed from NUM spam email, keep going for a cleaner inbox! 🤩`,
    tweet: `I’ve been cleaning up my inbox and have unsubscribed from NUM spam emails so far using @LeaveMeAloneApp 🤩 leavemealone.xyz`
  },
  {
    val: 2,
    text: `Congrats! You’ve unsubscribed from NUM spam emails, keep going for a cleaner inbox! 🤩`,
    tweet: `I’ve been cleaning up my inbox and have unsubscribed from NUM spam emails so far using @LeaveMeAloneApp 🤩 leavemealone.xyz`
  },
  {
    val: 5,
    text: `Wow! You’ve saved yourself from NUM spam emails so far, great job! 🙌`,
    tweet: `I’ve saved myself from NUM spam emails so far using @LeaveMeAloneApp 🙌 leavemealone.xyz`
  },
  {
    val: 20,
    text: `Bam! You’re on a roll, you’ve unsubscribed from NUM email lists so far 🎉`,
    tweet: `I’m on a roll, I’ve unsubscribed from NUM email lists so far using @LeaveMeAloneApp 🎉 leavemealone.xyz`
  },
  {
    val: 50,
    text: `Super user alert! Can you believe you’ve opted out of NUM spam email lists? 🔥`,
    tweet: `I’m a Leave Me Alone super user! Can you believe I’ve opted out of NUM spam email lists using @LeaveMeAloneApp 🔥 leavemealone.xyz`
  },
  {
    val: 100,
    text: `Incredible! You’ve hit NUM unsubscribes. I name you an unsubscribing master 👩‍🎓`,
    tweet: `I’ve hit NUM unsubscribes and been named an email un-subscribing master using @LeaveMeAloneApp 👩‍🎓 leavemealone.xyz`
  }
];

function List({
  mail = [],
  onUnsubscribe,
  isSearchFinished,
  showPriceModal,
  addUnsubscribeErrorResponse
}) {
  // const [unsubscribeError, setUnsubscribeError] = useState(null);
  const [unsubData, setUnsubData] = useState(null);

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
  const socialContent = getSocialContent(mail);
  const sortedMail = mail
    .sort((a, b) => {
      return +b.googleDate - +a.googleDate;
    })
    .reduce((out, mailItem, i) => {
      if (i === 9) {
        return [
          ...out,
          { type: 'mail', ...mailItem },
          { id: 'social', type: 'social' }
        ];
      }
      return [...out, { type: 'mail', ...mailItem }];
    }, []);
  return (
    <div className="mail-list">
      <TransitionGroup component="ul">
        {sortedMail.map(m =>
          m.type === 'mail' ? (
            <CSSTransition key={m.id} timeout={500} classNames="mail-list-item">
              <MailItem
                mail={m}
                onUnsubscribe={onUnsubscribe}
                setUnsubModal={setUnsubData}
              />
            </CSSTransition>
          ) : (
            <CSSTransition
              key="social"
              timeout={500}
              classNames="mail-list-item"
            >
              {socialContent}
            </CSSTransition>
          )
        )}
      </TransitionGroup>
      {unsubData ? (
        <UnsubModal
          onClose={() => {
            setUnsubData(null);
          }}
          onSubmit={({ success, useImage, failReason = null }) => {
            setUnsubData(null);
            addUnsubscribeErrorResponse({
              success,
              mailId: unsubData.id,
              image: useImage ? unsubData.image : null,
              from: unsubData.from,
              reason: failReason
            });
          }}
          mail={unsubData}
        />
      ) : null}
    </div>
  );
}

function MailItem({ mail: m, onUnsubscribe, setUnsubModal }) {
  const isSubscibed = !!m.subscribed;
  const [, fromName, fromEmail] = /^(.*)(<.*>)/.exec(m.from);
  return (
    <li className={`mail-list-item ${m.isLoading ? 'loading' : ''}`}>
      <div className="mail-item">
        <div className="avatar" />
        <div className="from">
          <span className="from-name">{fromName}</span>
          <span className="from-email">{fromEmail}</span>
          <span className="from-date">
            {format(+m.googleDate, mailDateFormat)}
          </span>
        </div>
        <div className="subject">{m.subject}</div>
        <div className="actions">
          {m.estimatedSuccess !== false ? (
            <Toggle
              status={isSubscibed}
              loading={m.isLoading}
              onChange={() => onUnsubscribe(m)}
            />
          ) : (
            <svg
              onClick={() => {
                debugger;
                setUnsubModal(m, true);
              }}
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
          {!isSubscibed ? (
            <a className="status" onClick={() => setUnsubModal(m)}>
              See details
            </a>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function getSocialContent(mail) {
  const unsubCount = mail.reduce((num, m) => (m.subscribed ? num : num + 1), 0);

  const socialOutput = progressTweets.reduce((out, progress) => {
    if (unsubCount >= progress.val) {
      return {
        text: progress.text.replace('NUM', unsubCount),
        tweet: encodeURIComponent(progress.tweet.replace('NUM', unsubCount))
      };
    }
    return out;
  }, null);
  return (
    <li className="mail-list-item mail-list-social">
      <div className="mail-item">
        <div className="avatar">
          <svg viewBox="0 0 64 64" width="32" height="32">
            <path
              strokeWidth="0"
              fill="currentColor"
              d="M60 16 L54 17 L58 12 L51 14 C42 4 28 15 32 24 C16 24 8 12 8 12 C8 12 2 21 12 28 L6 26 C6 32 10 36 17 38 L10 38 C14 46 21 46 21 46 C21 46 15 51 4 51 C37 67 57 37 54 21 Z"
            />
          </svg>
        </div>
        <div className="social-content">{socialOutput.text}</div>
        <div className="actions">
          <a
            target="_"
            href={`https://twitter.com/intent/tweet?text=${socialOutput.tweet}`}
            className="btn compact"
          >
            <svg viewBox="0 0 64 64" width="16" height="16">
              <path
                strokeWidth="0"
                fill="currentColor"
                d="M60 16 L54 17 L58 12 L51 14 C42 4 28 15 32 24 C16 24 8 12 8 12 C8 12 2 21 12 28 L6 26 C6 32 10 36 17 38 L10 38 C14 46 21 46 21 46 C21 46 15 51 4 51 C37 67 57 37 54 21 Z"
              />
            </svg>
            Tweet progress
          </a>
        </div>
      </div>
    </li>
  );
}
