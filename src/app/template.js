import './template.module.scss';

import React, { useState } from 'react';

import AppLayout from '../layouts/app-layout';
import Auth from '../components/auth';
import ErrorBoundary from '../components/error-boundary';
import Header from '../components/header';
import ReferralModal from '../components/modal/referral-modal';
import ReminderModal from '../components/modal/reminder-modal';
import request from '../utils/request';
import useUser from '../utils/hooks/use-user';

export default ({ pageName, children }) => {
  const [user, { setReminder: setUserReminder }] = useUser();

  const [showReferrerModal, toggleReferrerModal] = useState(false);
  const [showReminderModal, toggleReminderModal] = useState(false);

  const loaded = !!user;
  return (
    <AppLayout pageName={pageName}>
      <Auth loaded={loaded}>
        <Header
          loaded={loaded}
          onClickReminder={() => toggleReminderModal(true)}
          onClickReferral={() => toggleReferrerModal(true)}
        />
        <ErrorBoundary>
          <div styleName="app-content">{loaded ? children : null}</div>
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
    return request('/api/me/reminder', {
      method: 'PATCH',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ op, value: timeframe })
    });
  } catch (err) {
    console.log('toggle reminder err');
    throw err;
  }
}
