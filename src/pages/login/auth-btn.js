import './login.module.scss';

import { GoogleIcon, OutlookIcon } from '../../components/icons';
import React, { useContext, useEffect } from 'react';

import { LoginContext } from './index';

let windowObjectReference = null;
let previousUrl = null;
const windowFeatures = [
  // 'height=700',
  // 'width=600',
  // 'top=100',
  // 'left=100',
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
  if (event.origin !== process.env.BASE_URL) {
    return;
  }
  const params = event.data;
  const redirectUrl = `/auth/${provider}/callback${params}`;
  window.location.pathname = redirectUrl;
};

export default ({ provider }) => {
  const { dispatch } = useContext(LoginContext);

  useEffect(() => {
    return function cleanup() {
      window.removeEventListener('message', receiveMessage);
    };
  });

  const openSignInWindow = (url, name) => {
    window.removeEventListener('message', receiveMessage);

    const width = 600;
    const height = 700;

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
        href="/auth/google"
        target="SignInWindow"
        onClick={() => {
          openSignInWindow('/auth/google', 'SignInWindow');
          return false;
        }}
        onMouseEnter={() => dispatch({ type: 'set-active', data: true })}
        onMouseLeave={() => dispatch({ type: 'set-active', data: false })}
        styleName="login-me-in-dammit"
      >
        <GoogleIcon />
        <span styleName="text">Login with Google</span>
      </a>
    );
  } else if (provider === 'outlook') {
    return (
      <a
        href="/auth/outlook"
        target="SignInWindow"
        onClick={() => {
          openSignInWindow('/auth/outlook', 'SignInWindow');
          return false;
        }}
        onMouseEnter={() => dispatch({ type: 'set-active', data: true })}
        onMouseLeave={() => dispatch({ type: 'set-active', data: false })}
        styleName="login-me-in-dammit"
      >
        <OutlookIcon />
        <span styleName="text">Login with Outlook</span>
      </a>
    );
  } else {
    return null;
  }
};

function centerPopupPosition(popupWidth, popupHeight) {
  const windowWidth = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
    ? document.documentElement.clientWidth
    : screen.width;
  const windowHeight = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
    ? document.documentElement.clientHeight
    : screen.height;

  const left = (windowWidth - popupWidth) / 2;
  const top = (windowHeight - popupHeight) / 2;

  return {
    left,
    top
  };
}
