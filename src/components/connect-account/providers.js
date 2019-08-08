import './connect.module.scss';

import ConnectButton from './btn';
import React from 'react';

const providers = ['google', 'outlook', 'imap'];

export default ({ onSuccess = () => {}, onError = () => {}, imapOptions }) => {
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
