import './preferences.module.scss';

import { FormCheckbox } from '../../../components/form';
import ProfileLayout from './layout';
import React from 'react';
import request from '../../../utils/request';
import useUser from '../../../utils/hooks/use-user';

export async function savePreferences(data) {
  return request('/api/me/preferences', {
    method: 'PATCH',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ op: 'update', value: data })
  });
}

const DEFAULTS = {
  hideUnsubscribedMails: false,
  marketingConsent: true
};

export default () => {
  const [user, { setPreferences }] = useUser();
  const preferences = {
    hideUnsubscribedMails: getPref(user.preferences, 'hideUnsubscribedMails'),
    marketingConsent: getPref(user.preferences, 'marketingConsent')
  };

  const onChange = (key, value) => {
    const prefs = { ...preferences, [key]: value };
    savePreferences(prefs);
    setPreferences(prefs);
  };

  return (
    <ProfileLayout pageName="Preferences">
      <div styleName="preferences-section">
        <h2>Mail</h2>
        {/* <FormCheckbox
          onChange={() =>
            onChange(
              'hideUnsubscribedMails',
              !preferences.hideUnsubscribedMails
            )
          }
          checked={getPref(preferences, 'hideUnsubscribedMails')}
          label="Hide unsubscribed emails in future scans"
        /> */}
      </div>
      <div styleName="preferences-section">
        <h2>Marketing</h2>
        <FormCheckbox
          onChange={() =>
            onChange('marketingConsent', !preferences.marketingConsent)
          }
          checked={getPref(preferences, 'marketingConsent')}
          label="Receive product updates"
        />
      </div>
    </ProfileLayout>
  );
};

function getPref(prefs = {}, key) {
  const val = prefs[key];
  if (typeof val === 'undefined') return DEFAULTS[key];
  return val;
}
