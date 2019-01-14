import React, { useState, useEffect } from 'react';
import { Link } from 'gatsby';

import ErrorBoundary from '../../components/error-boundary';
import ReferralModal from '../../components/referral-modal';
import ReminderModal from '../../components/reminder-modal';
import AppLayout from '../../layouts/app-layout';
import Auth from '../../components/auth';
import Button from '../../components/btn';
import IgnoreIcon from '../../components/ignore-icon';
import logo from '../../assets/envelope-logo.png';
import useUser from '../../utils/hooks/use-user';

import { PRICES as modalPrices } from '../../components/price-modal';
import useLocalStorage from '../../utils/hooks/use-localstorage';

export default ({ children }) => {
  const [user, { setReminder: setUserReminder }] = useUser();
  const [showSettings, setShowSettings] = useState(false);
  const [showReferrerModal, toggleReferrerModal] = useState(false);
  const [showReminderModal, toggleReminderModal] = useState(false);

  const [localMail] = useLocalStorage(`leavemealone.mail.${user.id}`, []);
  console.log('template: local mail - ', localMail);

  const { profileImg, hasScanned, lastPaidScan, reminder = {} } = user;

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

  const isLastSearchPaid = hasScanned && lastPaidScan;
  const hasReminder = reminder && !reminder.sent;
  let nextReminder = null;

  if (isLastSearchPaid && !hasReminder) {
    const scanPerformed = modalPrices.find(
      p => p.value === lastPaidScan.scanType
    );
    nextReminder = {
      label: scanPerformed.label,
      timeframe: scanPerformed.value
    };

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
            <path d="M8 17 C8 12 9 6 16 6 23 6 24 12 24 17 24 22 27 25 27 25 L5 25 C5 25 8 22 8 17 Z M20 25 C20 25 20 29 16 29 12 29 12 25 12 25 M16 3 L16 6" />
          </svg>
        </span>
        Set reminder
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
        Show reminder
      </Button>
    );
  }

  return (
    <AppLayout>
      <Auth loaded={!!user}>
        <div className="header">
          <Link to="/app/" className="header-logo">
            <img alt="logo" src={logo} />
          </Link>
          <div className="header-title">Leave Me Alone </div>
          <div className="header-actions">
            {reminderButton}
            {user.beta ? (
              <Button
                className="header-btn"
                basic
                compact
                onClick={() => toggleReferrerModal(true)}
              >
                Refer a friend
              </Button>
            ) : null}
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
                  <a href="/auth/google">Switch account</a>
                </li>
                <li>
                  <Link to="/app/history/scans">Scan history</Link>
                </li>
                <li>
                  <Link to="/app/ignore">
                    <IgnoreIcon ignored={true} />
                    Ignored senders
                  </Link>
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
            currentReminder={reminder}
            nextReminder={nextReminder}
            mailCount={localMail.length}
            onSetReminder={async timeframe => {
              const { reminder } = await toggleReminder('add', timeframe);
              setUserReminder(reminder);
              toggleReminderModal(false);
            }}
            onClearReminder={async () => {
              await toggleReminder('remove');
              setUserReminder(null);
              toggleReminderModal(false);
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
