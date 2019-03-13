import './preferences.module.scss';

import React from 'react';

import { FormCheckbox } from '../../../components/form';
import ProfileLayout from './layout';
import useUser from '../../../utils/hooks/use-user';

export async function savePreferences(data) {
  const resp = await fetch('/api/me', {
    method: 'PATCH',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ op: 'preferences', value: data })
  });
  return resp.json();
}

const DEFAULTS = {
  hideUnsubscribedMails: false,
  marketingConsent: true
};

export default () => {
  const [preferences, { setPreferences }] = useUser(
    u => u.preferences || DEFAULTS
  );

  const onChange = (key, value) => {
    const prefs = { ...preferences, [key]: value };
    savePreferences(prefs);
    setPreferences(prefs);
  };

  return (
    <ProfileLayout pageName="Preferences">
      <div styleName="preferences-section">
        <h2>Mail</h2>
        <FormCheckbox
          onChange={() =>
            onChange(
              'hideUnsubscribedMails',
              !preferences.hideUnsubscribedMails
            )
          }
          checked={preferences.hideUnsubscribedMails}
          label="Hide unsubscribed mails in future scans"
        />
        <FormCheckbox
          onChange={() =>
            onChange('marketingConsent', !preferences.marketingConsent)
          }
          checked={preferences.marketingConsent}
          label="Get notified of updates to Leave Me Alone"
        />
      </div>
    </ProfileLayout>
  );
};
