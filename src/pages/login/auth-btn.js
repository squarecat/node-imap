import './login.module.scss';

import { GoogleIcon, MicrosoftIcon } from '../../components/icons';
import React, { useContext, useEffect } from 'react';

import { LoginContext } from './index';

const BASE_URL = process.env.BASE_URL;
let windowObjectReference = null;
let previousUrl = null;
const windowFeatures = [
  // A dependent window closes when its parent window closes.
  'dependent=yes',
  // hide menubars and toolbars for the simplest popup
  'menubar=no',
  'toolbar=no',
  'location=yes',
  // enable for accessibility
  'resizable=yes',
  'scrollbars=yes',
  'status=yes',
  // chrome specific
  'chrome=yes',
  'centerscreen=yes'
];

const receiveMessage = (event, provider) => {
  // Do we trust the sender of this message?  (might be
  // different from what we originally opened, for example).
  if (event.origin !== BASE_URL) {
    return;
  }
  const { data } = event;
  if (data.source === 'lma-login-redirect') {
    const { payload } = data;
    const redirectUrl = `/auth/${provider}/callback${payload}`;
    window.location.pathname = redirectUrl;
  }
};

export default ({ provider, action }) => {
  const { dispatch } = useContext(LoginContext);

  useEffect(() => {
    return function cleanup() {
      window.removeEventListener('message', receiveMessage);
    };
  });

  const openSignInWindow = (url, name) => {
    window.removeEventListener('message', receiveMessage);

    const width = 600;
    const height = 600;

    const { left, top } = centerPopupPosition(width, height);
    const strWindowFeatures = [
      ...windowFeatures,
      `width=${width}`,
      `height=${height}`,
      `top=${top}`,
      `left=${left}`
    ].join(',');

    if (windowObjectReference === null || windowObjectReference.closed) {
      windowObjectReference = window.open(url, name, strWindowFeatures);
    } else if (previousUrl !== url) {
      windowObjectReference = window.open(url, name, strWindowFeatures);
      windowObjectReference.focus();
    } else {
      windowObjectReference.focus();
    }

    window.addEventListener(
      'message',
      event => receiveMessage(event, provider),
      false
    );
    previousUrl = url;
  };

  if (provider === 'google') {
    return (
      <a
        key="google-auth-btn"
        href="/auth/google"
        target="SignInWindow"
        onClick={() => {
          openSignInWindow('/auth/google', 'SignInWindow');
          return false;
        }}
        styleName="login-me-in-dammit"
      >
        <GoogleIcon width="34" height="34" />
        <span>{`${action} with Google`}</span>
      </a>
    );
  } else if (provider === 'outlook') {
    return (
      <a
        key="outlook-auth-btn"
        href="/auth/outlook"
        target="SignInWindow"
        onClick={() => {
          openSignInWindow('/auth/outlook', 'SignInWindow');
          return false;
        }}
        styleName="login-me-in-dammit"
      >
        <MicrosoftIcon width="34" height="34" />
        <span>{`${action} with Microsoft`}</span>
      </a>
    );
  } else {
    return null;
  }
};

function centerPopupPosition(popupWidth, popupHeight) {
  if (!screen.width || !screen.height) {
    return {
      left: 'auto',
      top: 'auto'
    };
  }

  const windowWidth = screen.width;
  const windowHeight = screen.height;

  const left = windowWidth / 2 - popupWidth / 2;
  const top = windowHeight / 2 - popupHeight / 2;

  return {
    left,
    top
  };
}
