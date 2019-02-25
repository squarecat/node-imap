import './index.scss';

import React, { useEffect, useState } from 'react';

import AppLayout from '../../layouts/app-layout';
import Auth from '../../components/auth';
import Button from '../../components/btn';
import ErrorBoundary from '../../components/error-boundary';
import { Link } from 'gatsby';
import ReferralModal from '../../components/referral-modal';
import ReminderModal from '../../components/reminder-modal';
import logo from '../../assets/envelope-logo.png';
import useUser from '../../utils/hooks/use-user';

export default ({ pageName, children }) => {
  const [user, { setReminder: setUserReminder }] = useUser();
  const [showSettings, setShowSettings] = useState(false);
  const [showReferrerModal, toggleReferrerModal] = useState(false);
  const [showReminderModal, toggleReminderModal] = useState(false);

  const { profileImg, hasScanned, lastPaidScan, reminder } = user;

  const onClickBody = ({ target }) => {
    let { parentElement } = target;
    if (!parentElement) return;
    while (parentElement !== document.body) {
      if (parentElement.classList.contains('settings-dropdown-toggle')) {
        return;
      }
      parentElement = parentElement.parentElement;
    }
    setShowSettings(false);
  };

  useEffect(
    () => {
      if (showSettings) {
        document.body.addEventListener('click', onClickBody);
      } else {
        document.body.removeEventListener('click', onClickBody);
      }
      return () => document.body.removeEventListener('click', onClickBody);
    },
    [showSettings]
  );

  let reminderButton = null;

  const isLastSearchPaid = !!lastPaidScan;
  const hasReminder = reminder && !reminder.sent;

  if (isLastSearchPaid && !hasReminder) {
    reminderButton = (
      <Button
        className="header-btn"
        basic
        compact
        onClick={() => toggleReminderModal(true)}
      >
        <span className="reminder-icon">
          <svg
            viewBox="0 0 32 32"
            width="14"
            height="14"
            fill="none"
            stroke="currentcolor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          >
            <circle cx="16" cy="16" r="14" />
            <path d="M16 8 L16 16 20 20" />
          </svg>
        </span>
        <span className="header-btn-text header-btn-text--short">Remind</span>
        <span className="header-btn-text header-btn-text--long">
          Set reminder
        </span>
      </Button>
    );
  } else if (hasReminder) {
    reminderButton = (
      <Button
        className="header-btn"
        basic
        compact
        onClick={() => toggleReminderModal(true)}
      >
        <span className="reminder-icon unpadded">
          <svg
            viewBox="0 0 32 32"
            width="14"
            height="14"
            fill="none"
            stroke="currentcolor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          >
            <circle cx="16" cy="16" r="14" />
            <path d="M16 8 L16 16 20 20" />
          </svg>
        </span>
      </Button>
    );
  }

  return (
    <AppLayout pageName={pageName}>
      <Auth loaded={!!user}>
        <div className="header">
          <Link to="/app/" className="header-logo">
            <img alt="logo" src={logo} />
          </Link>
          <div className="header-title">Leave Me Alone </div>
          <div className="header-actions">
            {reminderButton}
            <button
              className="header-btn"
              onClick={() => toggleReferrerModal(true)}
            >
              <span className="header-btn-text header-btn-text--short">
                Refer
              </span>
              <span className="header-btn-text header-btn-text--long">
                Refer a friend
              </span>
            </button>
            <div className="settings-dropdown">
              <Button
                compact
                className={`settings-dropdown-toggle ${
                  showSettings ? 'shown' : ''
                }`}
                onClick={() => setShowSettings(!showSettings)}
              >
                <div className="profile">
                  <img className="profile-img" src={profileImg} />
                </div>
              </Button>
              <ul
                className={`settings-dropdown-list ${
                  showSettings ? 'shown' : ''
                }`}
              >
                <li>
                  <Link to="/app/profile">Account settings</Link>
                </li>
                <li>
                  <a href="/auth/google">Switch account</a>
                </li>
                <li className="support">
                  <a href="#" onClick={() => openChat()}>
                    Get help
                  </a>
                </li>
                <li className="logout">
                  <a href="/auth/logout">Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <ErrorBoundary>
          <div className="app-content">{children}</div>
        </ErrorBoundary>
        {showReferrerModal ? (
          <ReferralModal onClose={() => toggleReferrerModal(false)} />
        ) : null}
        {showReminderModal ? (
          <ReminderModal
            onSetReminder={async timeframe => {
              toggleReminderModal(false);
              const { reminder } = await toggleReminder('add', timeframe);
              setUserReminder(reminder);
            }}
            onClearReminder={async () => {
              toggleReminderModal(false);
              await toggleReminder('remove');
              setUserReminder(null);
            }}
            onClose={() => toggleReminderModal(false)}
          />
        ) : null}
      </Auth>
    </AppLayout>
  );
};

async function toggleReminder(op, timeframe = '') {
  try {
    const resp = await fetch('/api/me/reminder', {
      method: 'PATCH',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ op, value: timeframe })
    });
    return resp.json();
  } catch (err) {
    console.log('payment err');
    throw err;
  }
}

function openChat(message = '') {
  if (window.$crisp) {
    window.$crisp.push(['do', 'chat:show']);
    window.$crisp.push(['do', 'chat:open']);
    window.$crisp.push(['set', 'message:text', [message]]);
    window.$crisp.push(['on', 'chat:closed', closeChat]);
  }
}

function closeChat() {
  if (window.$crisp) {
    window.$crisp.push(['do', 'chat:hide']);
  }
}
