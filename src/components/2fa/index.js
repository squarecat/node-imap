import './2fa.module.scss';

import React, { useEffect, useState } from 'react';

import useAsync from '../../utils/hooks/use-async';
import request from '../../utils/request';

export default ({ onComplete = () => {}, onLoading = () => {} }) => {
  const [value, setValue] = useState('');
  const { value: verified, loading } = useAsync(verify, [value]);

  useEffect(
    () => {
      if (verified !== 'pending') {
        onComplete(verified, { token: value });
      }
      onLoading(loading);
    },
    [verified, loading]
  );

  return (
    <div styleName="two-factor-input">
      <input
        type="text"
        value={value}
        max="6"
        placeholder="Enter 6-digit code"
        onInput={({ currentTarget }) => setValue(currentTarget.value)}
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
