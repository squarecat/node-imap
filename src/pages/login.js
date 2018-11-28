import React, { useRef } from 'react';
// import PageTransition from 'gatsby-plugin-page-transitions';

import logo from '../assets/leave-me-logo.png';
import Layout from '../components/layout';
import './login.css';

const LoginPage = () => {
  const activeRef = useRef(null);
  const setActive = isActive => {
    activeRef.current.classList[isActive ? 'add' : 'remove']('active');
  };

  return (
    <Layout page="Login">
      <div ref={activeRef} className="hold-onto-your-butts-we-are-logging-in">
        <div className="login-boxy-box">
          <div className="beautiful-logo">
            <img src={logo} alt="logo" />
          </div>
          <p>
            <strong>Leave Me Alone</strong> needs to connect to your Gmail.
          </p>
          <p>
            Although we inspect your mail in order to find your subscriptions,
            unlike other services we <strong>NEVER</strong> store any of the
            content of your mail or any other private information!
          </p>
          <a
            href="/auth/google"
            onMouseEnter={() => setActive(true)}
            onMouseLeave={() => setActive(false)}
            className="beam-me-up-cta login-me-in-dammit"
          >
            Connect with Gmail
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
