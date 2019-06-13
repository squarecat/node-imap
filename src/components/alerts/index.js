import './alerts.module.scss';

import React from 'react';

export default ({ alert, onDismiss }) => {
  if (!alert) {
    return null;
  }
  const { isDismissable, isShown, level, message, actions } = alert;

  return (
    <div styleName="alert-banner" data-shown={isShown} data-level={level}>
      <span styleName="alert-message">{message}</span>
      {(actions || []).map(({ onClick, label }) => (
        <button styleName="alert-btn" key={label} onClick={onClick}>
          <span styleName="alert-btn-text">{label}</span>
        </button>
      ))}
      {isDismissable ? (
        <button styleName="alert-btn" onClick={onDismiss}>
          <span styleName="alert-btn-text">Dismiss</span>
        </button>
      ) : null}
    </div>
  );
};
