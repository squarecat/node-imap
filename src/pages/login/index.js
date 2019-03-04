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
          <p>
            <TextBold>Leave Me Alone</TextBold> needs to connect to your Gmail.
          </p>
          <p>
            Although we inspect your mail in order to find your subscriptions,
            unlike other services we <TextBold>NEVER</TextBold> store any of the
            content of your mail or any other private information!
          </p>
          <a
            href="/auth/google"
            onMouseEnter={() => setActive(true)}
            onMouseLeave={() => setActive(false)}
            styleName="login-me-in-dammit"
          >
            Connect with Gmail
          </a>
          <a
            href="/auth/outlook"
            onMouseEnter={() => setActive(true)}
            onMouseLeave={() => setActive(false)}
            styleName="login-me-in-dammit"
          >
            Connect with Outlook
          </a>
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
        Something went wrong logging you in. Please try again or contact
        support.
      </p>
    </div>
  );
}
