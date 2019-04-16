import { GoogleIcon, OutlookIcon } from '../../components/icons';
import React, { useEffect, useRef, useState } from 'react';

import Layout from '../../layouts/layout';
import { TextBold } from '../../components/text';
import logo from '../../assets/envelope-logo.png';
import styles from './login.module.scss';

let error;
if (typeof URLSearchParams !== 'undefined') {
  error = new URLSearchParams(window.location.search).get('error');
}

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

const LoginPage = () => {
  const activeRef = useRef(null);
  const setActive = isActive => {
    activeRef.current.classList[isActive ? 'add' : 'remove'](styles.active);
  };

  const [provider, setProvider] = useState(null);

  const receiveMessage = event => {
    // Do we trust the sender of this message?  (might be
    // different from what we originally opened, for example).
    if (event.origin !== process.env.ROOT_URL) {
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

  return (
    <Layout page="Login">
      <div ref={activeRef} styleName="hold-onto-your-butts-we-are-logging-in">
        <div styleName="login-boxy-box">
          <div styleName="beautiful-logo">
            <img src={logo} alt="logo" />
          </div>
          <h1 styleName="title">Login to Leave Me Alone</h1>
          <p>We need to connect to your email account.</p>
          <p>
            Although we inspect your mail in order to find your subscriptions,
            unlike other services we <TextBold>NEVER</TextBold> store any of the
            content of your mail or any other private information!
          </p>
          <div styleName="buttons">
            <a
              href="/auth/google"
              target="SignInWindow"
              onClick={() => {
                setProvider('google');
                openSignInWindow('/auth/google', 'SignInWindow');
                return false;
              }}
              onMouseEnter={() => setActive(true)}
              onMouseLeave={() => setActive(false)}
              styleName="login-me-in-dammit"
            >
              <GoogleIcon />
              <span styleName="text">Sign in with Google</span>
            </a>
            <a
              href="/auth/outlook"
              target="SignInWindow"
              onClick={() => {
                setProvider('outlook');
                openSignInWindow('/auth/outlook', 'SignInWindow');
                return false;
              }}
              onMouseEnter={() => setActive(true)}
              onMouseLeave={() => setActive(false)}
              styleName="login-me-in-dammit"
            >
              <OutlookIcon />
              <span styleName="text">Sign in with Outlook</span>
            </a>
          </div>
          {getError(error)}
          <p styleName="notice">
            We will use your email to send you product updates. You can opt-out
            at any time. We will NEVER share it with any third parties.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;

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

function getError(error) {
  if (!error) return null;

  const type = new URLSearchParams(window.location.search).get('type');
  if (type === 'beta') {
    return (
      <div styleName="error">
        <p>
          You do not have access to the beta.{' '}
          <a styleName="beta-link" href="/join-beta">
            Request access here
          </a>
          .
        </p>
      </div>
    );
  }
  return (
    <div styleName="error">
      <p>
        Something went wrong logging you in. Please try again or send us a
        message.
      </p>
    </div>
  );
}
