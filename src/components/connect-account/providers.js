import './connect.module.scss';

import ConnectButton from './btn';
import React from 'react';

const defaultProviders = ['google', 'outlook', 'imap'];

export default ({
  onSuccess = () => {},
  onError = () => {},
  showImap = false,
  imapOptions
}) => {
  console.log('showImap', showImap);
  let providers = defaultProviders;
  if (!showImap) providers = defaultProviders.filter(d => d !== 'imap');

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
