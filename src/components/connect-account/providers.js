import './connect.module.scss';

import ConnectButton from './btn';
import React from 'react';

const defaultProviders = ['google', 'outlook', 'imap'];

export default ({ onSuccess = () => {}, onError = () => {}, imapOptions }) => {
  let providers = defaultProviders;

  return (
    <div styleName="provider-btn-grid">
      {providers.map(providerName => (
        <ConnectButton
          key={providerName}
          provider={providerName}
          onSuccess={onSuccess}
          onError={onError}
          imapOptions={imapOptions}
        />
      ))}
    </div>
  );
};
