import './preferences.module.scss';

import { FormCheckbox } from '../../../components/form';
import ProfileLayout from '../../../app/profile/layout';
import React from 'react';
import { TextLink } from '../../../components/text';
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
  marketingConsent: true,
  occurrencesConsent: true
};

export default () => {
  const [user, { setPreferences }] = useUser();
  const preferences = {
    marketingConsent: getPref(user.preferences, 'marketingConsent'),
    occurrencesConsent: getPref(user.preferences, 'occurrencesConsent')
  };

  const onChange = (key, value) => {
    const prefs = { ...preferences, [key]: value };
    savePreferences(prefs);
    setPreferences(prefs);
  };

  return (
    <ProfileLayout pageName="Preferences">
      <div styleName="preferences-section">
        <h2>Help other Leave Me Alone users</h2>
        <p>
          We collect completely anonymous data about the senders of subscription
          emails you receive to power our <b>Subscriber Score</b> algorithm.
          This information improves the quality of Leave Me Alone for all users.
          If you don't want to contribute your data to this algorithm for
          whatever reason then you can opt-out below.
        </p>
        <p>
          Your data will NEVER be sold and cannot be de-anonymised in any way.
        </p>
        <p>
          <TextLink href="/security" target="_">
            Read more about security, the data we collect, and how we use it.
          </TextLink>
        </p>

        <FormCheckbox
          onChange={() =>
            onChange('occurrencesConsent', !preferences.occurrencesConsent)
          }
          checked={getPref(preferences, 'occurrencesConsent')}
          label="Consent to us using your data anonymously to help improve our service"
        />
      </div>
      <div styleName="preferences-section">
        <h2>Marketing</h2>
        <p>
          We will use your email to very occassionally send you product updates.
          You can opt-out at any time. We will NEVER share it with anyone, for
          any reason, EVER.
        </p>

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
