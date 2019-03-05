import React, { useRef } from 'react';

import Layout from '../../layouts/layout';
import { TextBold } from '../../components/text';
import { TextLink } from '../../components/text';
import logo from '../../assets/envelope-logo.png';
import styles from './login.module.scss';

let error;
if (typeof URLSearchParams !== 'undefined') {
  error = new URLSearchParams(window.location.search).get('error');
}

const LoginPage = () => {
  const activeRef = useRef(null);
  const setActive = isActive => {
    activeRef.current.classList[isActive ? 'add' : 'remove'](styles.active);
  };

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
              onMouseEnter={() => setActive(true)}
              onMouseLeave={() => setActive(false)}
              styleName="login-me-in-dammit"
            >
              <GoogleIcon />
              <span styleName="text">Sign in with Google</span>
            </a>
            <a
              href="/auth/outlook"
              onMouseEnter={() => setActive(true)}
              onMouseLeave={() => setActive(false)}
              styleName="login-me-in-dammit"
            >
              <OutlookIcon />
              <span styleName="text">Sign in with Outlook</span>
            </a>
          </div>
          {getError(error)}
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;

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

function OutlookIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 48 48">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.991 21.991 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
      <path fill="none" d="M2 2h44v44H2z" />
    </svg>
  );
}
