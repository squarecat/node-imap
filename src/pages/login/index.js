import { GoogleIcon, OutlookIcon } from '../../components/icons';
import React, { useRef } from 'react';

import Layout from '../../layouts/layout';
import { TextBold } from '../../components/text';
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
