import './connect.module.scss';

import ConnectButton from './btn';
import React from 'react';

const providers = ['google', 'outlook'];

export default ({ onSuccess, onError }) => {
  return (
    <div styleName="provider-btn-grid">
      {providers.map(providerName => (
        <ConnectButton
          key={providerName}
          provider={providerName}
          onSuccess={() => onSuccess()}
          onError={() => onError()}
        />
      ))}
    </div>
  );
};
