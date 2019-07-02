import './2fa.module.scss';

import React, { useEffect, useState } from 'react';

import request from '../../utils/request';
import { useAsync } from 'react-use';

export default ({ onComplete = () => {}, onLoading = () => {} }) => {
  const [value, setValue] = useState('');
  const [verified, setVerified] = useState('pending');
  const [loading, setLoading] = useState(false);

  useEffect(
    () => {
      if (value.length > 5) {
        setLoading(true);
        verify(value)
          .then(isVerified => setVerified(isVerified))
          .catch(e => console.error(e))
          .then(() => setLoading(false));
      }
    },
    [value]
  );

  useEffect(
    () => {
      if (verified !== 'pending') {
        onComplete(verified, { token: value });
      }
      onLoading(loading);
    },
    [verified, loading, onLoading, onComplete, value]
  );

  return (
    <div styleName="two-factor-input">
      <input
        autoFocus
        type="text"
        value={value}
        max="6"
        placeholder="Enter 6-digit code"
        onChange={({ currentTarget }) => {
          console.log(currentTarget.value);
          setValue(currentTarget.value);
        }}
      />
    </div>
  );
};

async function verify(token) {
  if (token.length < 6) {
    return 'pending';
  }
  const res = await request('/auth/totp', {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ token })
  });

  return res.success;
}
