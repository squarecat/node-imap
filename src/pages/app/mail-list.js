import 'rc-tooltip/assets/bootstrap_white.css';
import './mail-list.scss';

import { AutoSizer, List as VirtualList } from 'react-virtualized';
import React, { useEffect, useReducer, useState } from 'react';
import { ReloadIcon, TwitterIcon } from '../../components/icons';

import AnimatedNumber from 'react-animated-number';
import Button from '../../components/btn';
import { CSSTransition } from 'react-transition-group';
import ErrorBoundary from '../../components/error-boundary';
import IgnoreIcon from '../../components/ignore-icon';
import MailListEmptyState from './mail-list/empty-state';
import RescanModal from '../../components/modal/rescan-modal';
import { TextLink } from '../../components/text';
import Toggle from '../../components/toggle';
import Tooltip from 'rc-tooltip';
import UnsubModal from '../../components/modal/unsub-modal';
import _isArray from 'lodash.isarray';
import favicon from '../../assets/meta/favicon.png';
import faviconFinished from '../../assets/meta/favicon-done.png';
import faviconScanning from '../../assets/meta/favicon-scanning.png';
import format from 'date-fns/format';
import { getSubsEstimate } from '../../utils/estimates';
import io from 'socket.io-client';
import { isRescanAvailable } from '../../utils/scans';
import { toggleFromIgnoreList } from './profile/ignore';
import useLocalStorage from '../../utils/hooks/use-localstorage';
import useUser from '../../utils/hooks/use-user';

const mailDateFormat = 'Do MMM YYYY HH:mm';

const mailReducer = (state = [], action) => {
  switch (action.type) {
    case 'add':
      return [
        ...state,
        { ...action.data, error: !action.data.estimatedSuccess }
      ];
    case 'add-all':
      return [
        ...state,
        ...action.data.map(m => ({
          ...m,
          error: !action.data.estimatedSuccess
        }))
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
    case 'add-ignore': {
      return state.map(email =>
        email.id === action.data.id ? { ...email, ignored: true } : email
      );
    }
    case 'remove-ignore': {
      return state.map(email =>
        email.id === action.data.id ? { ...email, ignored: false } : email
      );
    }
    default:
      return state;
  }
};

function useSocket(callback) {
  const [user, { incrementUnsubCount }] = useUser();
  const preferences = user.preferences || {};

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

export default ({ timeframe, setTimeframe, showPriceModal }) => {
  const [isSearchFinished, setSearchFinished] = useState(false);
  const [showRescanModal, toggleRescanModal] = useState(false);
  const [user, { setLastScan }] = useUser();

  const { lastScan } = user;

  const {
    mail,
    fetchMail,
    unsubscribeMail,
    isConnected,
    addUnsubscribeErrorResponse,
    progress,
    error,
    dispatch
  } = useSocket((err, scan) => {
    changeFavicon(false, true);
    setSearchFinished(true);
    if (scan) setLastScan(scan);
  });
  const [lastSearchTimeframe, setLastSearchTimeframe] = useLocalStorage(
    `leavemealone.timeframe.${user ? user.id : ''}`,
    []
  );

  function doSearch() {
    setSearchFinished(false);
    fetchMail(timeframe);
  }

  function performScan() {
    setLastSearchTimeframe(timeframe);
    changeFavicon(true, false);
    doSearch();
  }

  function onRescan(tf) {
    if (tf !== timeframe) {
      setTimeframe(tf);
    } else {
      performScan();
    }
  }

  useEffect(
    () => {
      if (isConnected && timeframe) {
        performScan();
      } else if (!timeframe) {
        changeFavicon(false, false);
        setSearchFinished(true);
      }
    },
    [isConnected, timeframe]
  );

  // because the count is estimated, the progress can go above 100%
  // so here we make it more believable
  const believableProgress = progress > 95 ? 98 : progress;
  // if progress changes then we are definitely
  // not finished
  useEffect(
    () => {
      setSearchFinished(false);
    },
    [believableProgress !== 100, believableProgress !== 0]
  );

  const { scanName, moreSubsPrice, moreSubsEstimate } = getSubsEstimate(
    timeframe || lastSearchTimeframe,
    mail.length
  );

  const onShowPriceModal = () => {
    if (isRescanAvailable(lastScan)) {
      return toggleRescanModal(true);
    }
    return showPriceModal(true);
  };

  const showMoreText =
    isSearchFinished && timeframe !== '6m' && moreSubsEstimate !== 0;
  // const scanMessage = `Depending on the size of your inbox this may take a while, feel
  //   free to check back later, but please don't close this window.`;

  return (
    <>
      <div className={`mail-actions ${isSearchFinished ? 'finished' : ''}`}>
        <div className="mail-actions-content">
          <span className="action-item results-data">
            <span className="quantity">{mail ? mail.length : 0}</span>
            subscriptions <span className="extra">found</span>
          </span>
          <span className="action-item progress">
            <span>
              {`Scanning ${scanName ? `for ${scanName}` : ''}... ${
                isSearchFinished ? 100 : believableProgress
              }%`}
            </span>
            {/* <span>{scanMessage}</span> */}
          </span>
          <span className="action-item">
            <a onClick={() => onShowPriceModal()} className="scan-more-btn">
              <ReloadIcon />
              Scan more
            </a>

            <span className={`scan-more-text ${showMoreText ? 'shown' : ''}`}>
              Clear <span className="more-subs">{moreSubsEstimate}</span> more
              subscriptions for just{' '}
              <span className="more-subs-price">{moreSubsPrice}</span>
            </span>
          </span>
        </div>
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
            onClickRescan={tf => onRescan(tf)}
            dispatch={dispatch}
          />
          {getSocialContent(user.unsubCount, user.referralCode)}
        </ErrorBoundary>
      )}
      {showRescanModal ? (
        <RescanModal
          onRescan={tf => {
            onRescan(tf);
            toggleRescanModal(false);
          }}
          onPurchase={() => {
            toggleRescanModal(false);
            showPriceModal(true);
          }}
          onClose={() => {
            toggleRescanModal(false);
          }}
        />
      ) : null}
    </>
  );
};

function ErrorScreen({ error, retry }) {
  if (error === 'Error: Invalid Credentials') {
    return (
      <div className="mail-error">
        <p>
          Oh no, it looks like your credentials have become invalid somehow,
          perhaps you revoked your token?
        </p>

        <Button centered muted basic onClick={retry}>
          Retry
        </Button>

        <p>
          If this keeps happening please try{' '}
          <TextLink href="/auth/logout">logging out</TextLink> and back in again
          to refresh your credentials. Thanks!
        </p>
        <pre className="error-details">{error}</pre>
      </div>
    );
  } else if (error === 'Not paid') {
    return (
      <div className="mail-error">
        <p>
          Oh no, you've used up all of your paid scans, use the 'Scan more'
          button above to purchase a new scan
        </p>
        <p>
          Think you're seeing this screen in error?{' '}
          <TextLink
            onClick={() =>
              openChat("Hi! I've paid for a scan but I can't perform it!")
            }
          >
            Let us know!
          </TextLink>
        </p>
      </div>
    );
  }
  return (
    <div className="mail-error">
      <p>Oh no, something went wrong on our end. Please try and scan again</p>

      <Button centered muted basic onClick={retry}>
        Retry
      </Button>

      <p>
        This is definitely our fault, so if it still doesn't work then please
        bear with us and we'll try and get it sorted for you!
      </p>
      <pre className="error-details">{error}</pre>
    </div>
  );
}

function RevokeTokenInstructions({ style, provider }) {
  let providerName;
  let url;
  if (provider === 'google') {
    providerName = 'Google';
    url = 'https://security.google.com/settings/security/permissions';
  } else if (provider === 'outlook') {
    providerName = 'Microsoft';
    url = 'https://account.live.com/consent/Manage';
  }
  return (
    <div className="revoke-token-instructions" style={style}>
      <p>
        You can revoke access to Leave Me Alone any time by visiting your{' '}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="revoke-link"
        >
          <span>{providerName} Account Settings</span>
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
    tweet: `I’m using @LeaveMeAloneApp to take back control of my inbox and unsubscribe from email lists with one click! 💌 leavemealone.xyz/r/REFERRAL`
  },
  {
    val: 1,
    text: `Congrats! You’ve unsubscribed from NUM spam email, keep going for a cleaner inbox! 🤩`,
    tweet: `I’ve been cleaning up my inbox and have unsubscribed from NUM spam email so far using @LeaveMeAloneApp 🤩 leavemealone.xyz/r/REFERRAL`
  },
  {
    val: 2,
    text: `Congrats! You’ve unsubscribed from NUM spam emails, keep going for a cleaner inbox! 🤩`,
    tweet: `I’ve been cleaning up my inbox and have unsubscribed from NUM spam emails so far using @LeaveMeAloneApp 🤩 leavemealone.xyz/r/REFERRAL`
  },
  {
    val: 5,
    text: `Wow! You’ve saved yourself from NUM spam emails so far, great job! 🙌`,
    tweet: `I’ve saved myself from NUM spam emails so far using @LeaveMeAloneApp 🙌 leavemealone.xyz/r/REFERRAL`
  },
  {
    val: 20,
    text: `Bam! You’re on a roll, you’ve unsubscribed from NUM email lists so far 🎉`,
    tweet: `I’m on a roll, I’ve unsubscribed from NUM spam email lists so far using @LeaveMeAloneApp 🎉 leavemealone.xyz/r/REFERRAL`
  },
  {
    val: 50,
    text: `Super user alert! Can you believe you’ve opted out of NUM spam email lists? 🔥`,
    tweet: `I’m a Leave Me Alone super user! Can you believe I’ve opted out of NUM spam email lists using @LeaveMeAloneApp 🔥 leavemealone.xyz/r/REFERRAL`
  },
  {
    val: 100,
    text: `Incredible! You’ve hit NUM unsubscribes. We name you an unsubscribing master 👩‍🎓`,
    tweet: `I’ve hit NUM unsubscribes and been named an email un-subscribing master using @LeaveMeAloneApp 👩‍🎓 leavemealone.xyz/r/REFERRAL`
  }
];

function List({
  mail = [],
  onUnsubscribe,
  isSearchFinished,
  showPriceModal,
  addUnsubscribeErrorResponse,
  onClickRescan,
  dispatch
}) {
  const [unsubData, setUnsubData] = useState(null);
  const [{ provider, lastScan }] = useUser(({ provider, lastScan }) => ({
    provider,
    lastScan
  }));

  if (!mail.length && isSearchFinished) {
    return (
      <MailListEmptyState
        lastScan={lastScan}
        onClickRescan={tf => onClickRescan(tf)}
        showPriceModal={showPriceModal}
      />
    );
  }

  const isTweetPosition = (pos, arrLen) => {
    return pos === 9 || (isSearchFinished && arrLen < 10 && pos === arrLen - 1);
  };

  let sortedMail = mail
    .sort((a, b) => {
      return +b.date - +a.date;
    })
    .reduce((out, mailItem, i) => {
      if (isTweetPosition(i, mail.length)) {
        return [...out, { type: 'mail', ...mailItem }];
      }
      return [...out, { type: 'mail', ...mailItem }];
    }, []);
  if (isSearchFinished) {
    sortedMail = [...sortedMail, { id: 'notice', type: 'notice' }];
  }
  return (
    <AutoSizer>
      {({ width, height }) => (
        <div className="mail-list">
          {/* <TransitionGroup component="div"> */}
          <VirtualList
            height={height - 90}
            rowHeight={120}
            rowCount={sortedMail.length}
            width={width}
            rowRenderer={({ index, key, style }) => {
              const m = sortedMail[index];
              if (m.type === 'mail') {
                return (
                  <CSSTransition
                    key={key}
                    timeout={500}
                    classNames="mail-list-item"
                  >
                    <MailItem
                      key={m.id}
                      style={style}
                      mail={m}
                      onUnsubscribe={onUnsubscribe}
                      setUnsubModal={setUnsubData}
                      dispatch={dispatch}
                    />
                  </CSSTransition>
                );
              } else if (m.type === 'notice') {
                return (
                  <RevokeTokenInstructions
                    key={key}
                    provider={provider}
                    style={style}
                  />
                );
              }
            }}
          />
          {/* </TransitionGroup> */}

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
                  reason: failReason,
                  unsubStrategy: unsubData.unsubStrategy
                });
              }}
              mail={unsubData}
            />
          ) : null}
        </div>
      )}
    </AutoSizer>
  );
}

function MailItem({ mail: m, onUnsubscribe, setUnsubModal, style }) {
  const [user, { setIgnoredSenderList }] = useUser();
  const ignoredSenderList = user.ignoredSenderList || [];
  const isSubscribed = !!m.subscribed;
  let fromName;
  let fromEmail;
  if (m.from.match(/^.*<.*>/)) {
    const [, name, email] = /^(.*)(<.*>)/.exec(m.from);
    fromName = name;
    fromEmail = email;
  } else {
    fromName = '';
    fromEmail = m.from;
  }
  const pureEmail = fromEmail.substr(1).substr(0, fromEmail.length - 2);
  const isIgnored = ignoredSenderList.includes(pureEmail);
  const clickIgnore = () => {
    const newList = isIgnored
      ? ignoredSenderList.filter(sender => sender !== pureEmail)
      : [...ignoredSenderList, pureEmail];
    toggleFromIgnoreList(pureEmail, isIgnored ? 'remove' : 'add');
    setIgnoredSenderList(newList);
    return false;
  };

  return (
    <div
      style={style}
      className={`mail-list-item ${m.isLoading ? 'loading' : ''}`}
    >
      <div className="mail-item">
        <div className="avatar" />
        <div className="from">
          <span className="from-name">
            <Tooltip
              placement="top"
              trigger={['hover']}
              mouseLeaveDelay={0}
              overlayClassName="tooltip"
              destroyTooltipOnHide={true}
              overlay={
                <span>
                  {isIgnored
                    ? 'This sender is on your favorite list'
                    : 'Click to ignore this sender in future scans'}
                </span>
              }
            >
              <a onClick={() => clickIgnore()}>
                <IgnoreIcon ignored={isIgnored} />
              </a>
            </Tooltip>
            {fromName}
          </span>
          <span className="from-email">{fromEmail}</span>
          <span className="from-date">
            {format(new Date(m.date), mailDateFormat)}
          </span>
          {m.isTrash ? (
            <Tooltip
              placement="top"
              trigger={['hover']}
              mouseLeaveDelay={0}
              overlayClassName="tooltip"
              destroyTooltipOnHide={true}
              overlay={<span>This email was in your trash folder</span>}
            >
              <span className="trash">trash</span>
            </Tooltip>
          ) : null}
          {m.isSpam ? (
            <Tooltip
              placement="top"
              trigger={['hover']}
              mouseLeaveDelay={0}
              overlayClassName="tooltip"
              destroyTooltipOnHide={true}
              overlay={<span>This email was in your spam folder</span>}
            >
              <span className="trash">spam</span>
            </Tooltip>
          ) : null}
        </div>
        <div className="subject">{m.subject}</div>
        <div className="actions">
          {m.estimatedSuccess !== false || m.resolved ? (
            <Toggle
              status={isSubscribed}
              loading={m.isLoading}
              disabled={isIgnored}
              onChange={() => onUnsubscribe(m)}
            />
          ) : (
            <svg
              onClick={() => setUnsubModal(m, true)}
              className="failed-to-unsub-icon"
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
          {!isSubscribed ? (
            <a className="status" onClick={() => setUnsubModal(m)}>
              See details
            </a>
          ) : (
            <span className="status subscribed">Subscribed</span>
          )}
        </div>
      </div>
    </div>
  );
}

function getSocialContent(unsubCount = 0, referralCode) {
  const socialOutput = progressTweets.reduce(
    (out, progress) => {
      if (unsubCount >= progress.val) {
        return {
          text: progress.text.replace('NUM', unsubCount),
          tweet: encodeURIComponent(
            progress.tweet
              .replace('NUM', unsubCount)
              .replace('REFERRAL', referralCode)
          )
        };
      }
      return out;
    },
    { text: null, tweet: null }
  );

  return (
    <div className={`mail-list-social`}>
      <div className="social-item">
        <div className="avatar">
          <AnimatedNumber value={unsubCount} stepPrecision={1} duration={300} />
        </div>
        <div className="social-switch">
          <div className="social-content">{socialOutput.text}</div>
          <div className="actions">
            <a
              target="_"
              href={`https://twitter.com/intent/tweet?text=${
                socialOutput.tweet
              }`}
              className="tweet-btn"
            >
              <TwitterIcon />
              <span>
                Tweet <span className="tweet-text-extra">progress</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function openChat(message = '') {
  if (window.$crisp) {
    window.$crisp.push(['do', 'chat:open']);
    window.$crisp.push(['set', 'message:text', [message]]);
  }
}

let head;
if (typeof document !== 'undefined') {
  head =
    document.head || (document.head = document.getElementsByTagName('head')[0]);
}

let checkFocusInterval;
function changeFavicon(scanning = false, isSearchFinished = false) {
  let src = favicon;
  let title = 'Home | Leave Me Alone';

  if (scanning) {
    title = 'Scanning... | Leave Me Alone';
    src = faviconScanning;
  }
  if (isSearchFinished) {
    title = 'Finished! | Leave Me Alone';
    src = faviconFinished;
    checkFocusInterval = setInterval(checkFocus, 1000);
  }

  // cache bust
  src = `${src}?=${Date.now()}`;

  const link = document.createElement('link');
  const oldLink = document.getElementById('dynamic-favicon');
  link.id = 'dynamic-favicon';
  link.rel = 'shortcut icon';
  link.href = src;
  if (oldLink) {
    head.removeChild(oldLink);
  }
  head.appendChild(link);
  document.title = title;
}

function checkFocus() {
  if (document.hasFocus()) {
    clearInterval(checkFocusInterval);
    setTimeout(() => {
      changeFavicon(false, false);
    }, 2000);
  }
}
