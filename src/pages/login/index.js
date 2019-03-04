import React, { useRef } from 'react';

import Layout from '../../layouts/layout';
import { TextBold } from '../../components/text';
import logo from '../../assets/envelope-logo.png';
import styles from './login.module.scss';

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
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
