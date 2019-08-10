import './connect.module.scss';

import ConnectButton from './btn';
import React from 'react';
import cx from 'classnames';

const defaultProviders = ['google', 'outlook', 'imap'];

export default ({
  onSuccess = () => {},
  onError = () => {},
  hideImap = false,
  imapOptions
}) => {
  const providers = hideImap
    ? defaultProviders.filter(p => p !== 'imap')
    : defaultProviders;

  const classes = cx(`provider-btn-grid`, {
    column: hideImap
  });

  return (
    <div styleName={classes}>
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
