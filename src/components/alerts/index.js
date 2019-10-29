import React, { useEffect, useMemo } from 'react';

import ReactDOM from 'react-dom';
import { Transition } from 'react-transition-group';
import { getTransitionClasses } from '../../utils/transition';
import styles from './alerts.module.scss';

let alertRoot;

if (typeof window !== 'undefined') {
  alertRoot = window.document.getElementById('alert-root');
}

export default ({ alert, onDismiss }) => {
  const content = useMemo(() => {
    if (!alert) {
      return (
        <div
          styleName="alert-banner"
          data-shown="false"
          data-level="none"
        ></div>
      );
    }
    const { isDismissable, isShown, level, message, actions } = alert;
    return (
      <Transition
        appear
        unmountOnExit
        timeout={250}
        in={isShown}
        key={alert.message}
      >
        {state => {
          const classes = getTransitionClasses('alertBanner', state, styles);
          const live = level === 'error' ? 'assertive' : 'polite';
          return (
            <div
              aria-live={live}
              className={classes}
              data-shown={isShown}
              data-level={level}
            >
              <span styleName="alert-message">{message}</span>
              {(actions || []).map(({ onClick, label }) => (
                <button styleName="alert-btn" key={label} onClick={onClick}>
                  <span styleName="alert-btn-text">{label}</span>
                </button>
              ))}
              {isDismissable ? (
                <button styleName="alert-btn" onClick={() => onDismiss()}>
                  <span styleName="alert-btn-text">Dismiss</span>
                </button>
              ) : null}
            </div>
          );
        }}
      </Transition>
    );
  }, [alert, onDismiss]);

  if (alertRoot) {
    return ReactDOM.createPortal(content, alertRoot);
  }
  return content;
};
