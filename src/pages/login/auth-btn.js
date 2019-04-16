import './login.module.scss';

import { GoogleIcon, OutlookIcon } from '../../components/icons';
import React, { useContext, useEffect } from 'react';

import { LoginContext } from './index';

let windowObjectReference = null;
let previousUrl = null;
const strWindowFeatures = [
  'height=700',
  'width=600',
  'top=100',
  'left=100',
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
].join(',');

export default ({ provider }) => {
  const { dispatch } = useContext(LoginContext);

  const receiveMessage = event => {
    // Do we trust the sender of this message?  (might be
    // different from what we originally opened, for example).
    if (event.origin !== process.env.BASE_URL) {
      return;
    }

    const params = event.data;
    const redirectUrl = `/auth/${provider}/callback${params}`;
    window.location.pathname = redirectUrl;
  };

  useEffect(() => {
    window.addEventListener('message', receiveMessage, false);
    return () => window.removeEventListener('message', receiveMessage);
  });

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

// https://developer.mozilla.org/en-US/docs/Web/API/Window/open
function openSignInWindow(url, name) {
  if (windowObjectReference === null || windowObjectReference.closed) {
    /* if the pointer to the window object in memory does not exist
     or if such pointer exists but the window was closed */

    windowObjectReference = window.open(url, name, strWindowFeatures);
    /* then create it. The new window will be created and
       will be brought on top of any other window. */
  } else if (previousUrl !== url) {
    windowObjectReference = window.open(url, name, strWindowFeatures);
    /* if the resource to load is different,
       then we load it in the already opened secondary window and then
       we bring such window back on top/in front of its parent window. */
    windowObjectReference.focus();
  } else {
    windowObjectReference.focus();
    /* else the window reference must exist and the window
       is not closed; therefore, we can bring it back on top of any other
       window with the focus() method. There would be no need to re-create
       the window or to reload the referenced resource. */
  }

  previousUrl = url;
}
