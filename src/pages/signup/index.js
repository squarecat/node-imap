import { FormGroup, FormInput, FormLabel } from '../../components/form';
import React, { useRef, useState } from 'react';

import Layout from '../../layouts/layout';
import PasswordInput from '../../components/form/password';
import cx from 'classnames';
import logo from '../../assets/envelope-logo.png';
import styles from '../login/login.module.scss';

let error;
let strategy;
let message;
let username = '';
if (typeof URLSearchParams !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  error = urlParams.get('error');
  strategy = urlParams.get('strategy');
  message = urlParams.get('message');
  username = urlParams.get('username');
}

const LoginPage = () => {
  const activeRef = useRef(null);
  const [isPassword, setPassword] = useState(strategy === 'password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [formError] = useState(error);
  const [emailAddress, setEmailAddress] = useState(username);

  const setActive = isActive => {
    activeRef.current.classList[isActive ? 'add' : 'remove'](styles.active);
  };
  const matchPass = useRef(null);
  const classes = cx('hold-onto-your-butts-we-are-logging-in', {
    'password-login': isPassword,
    errored: !!formError
  });
  return (
    <Layout page="Signup">
      <div ref={activeRef} styleName={classes}>
        <div styleName="login-boxy-box">
          <div styleName="beautiful-logo">
            <img src={logo} alt="logo" />
          </div>
          <h1 styleName="title">Sign up to Leave Me Alone</h1>
          <p>Google and Outlook authorize Leave Me Alone without a password.</p>
          {/* <p>
            Although we inspect your mail in order to find your subscriptions,
            unlike other services we <TextBold>NEVER</TextBold> store any of the
            content of your mail or any other private information!
          </p> */}
          <div styleName="buttons">
            <a
              onClick={() => setPassword(true)}
              onMouseEnter={() => setActive(true)}
              onMouseLeave={() => setActive(false)}
              styleName="login-me-in-dammit"
            >
              <span styleName="text">Sign up with Password</span>
            </a>
            <a
              href="/auth/google"
              onMouseEnter={() => setActive(true)}
              onMouseLeave={() => setActive(false)}
              styleName="login-me-in-dammit"
            >
              <GoogleIcon />
              <span styleName="text">Sign up with Google</span>
            </a>
            <a
              href="/auth/outlook"
              onMouseEnter={() => setActive(true)}
              onMouseLeave={() => setActive(false)}
              styleName="login-me-in-dammit"
            >
              <OutlookIcon />
              <span styleName="text">Sign up with Outlook</span>
            </a>
          </div>
          {getError(error)}
          <p styleName="notice">
            We will use your email to very occassionally send you product
            updates. You can opt-out at any time. We will NEVER share it with
            anyone, for any reason, EVER.
          </p>
        </div>
        <div styleName="password-login-box">
          <div styleName="beautiful-logo">
            <img src={logo} alt="logo" />
          </div>
          <h1 styleName="title">Sign up to Leave Me Alone</h1>
          <p>You're one step away from a clean inbox!</p>
          <form
            id="signup-form"
            styleName="sign-up-form"
            action="/auth/signup"
            method="post"
          >
            <FormGroup fluid>
              <FormLabel htmlFor="username">Email address</FormLabel>
              <FormInput
                noFocus
                compact
                id="username"
                type="email"
                name="username"
                required
                onChange={({ currentTarget }) =>
                  setEmailAddress(currentTarget.value)
                }
                value={emailAddress}
              />
            </FormGroup>
            <FormGroup fluid>
              <FormLabel htmlFor="password">Password</FormLabel>
              <PasswordInput
                onChange={password => {
                  setCurrentPassword(password);
                }}
              />
            </FormGroup>
            <FormGroup fluid>
              <FormLabel htmlFor="password-confirm">Confirm password</FormLabel>
              <FormInput
                ref={matchPass}
                id="password-confirm"
                type="password"
                name="password-confirm"
                required
                compact
                validation={value =>
                  value === currentPassword ? true : 'Passwords must match.'
                }
              />
            </FormGroup>
            {formError ? (
              <div styleName="error">
                <p>{message}</p>
              </div>
            ) : null}
            <div styleName="signup-buttons">
              <button
                type="button"
                onClick={e => setPassword(false) || e.preventDefault()}
                onMouseEnter={() => setActive(true)}
                onMouseLeave={() => setActive(false)}
                styleName="signup-btn back-btn"
              >
                <span styleName="text">Back</span>
              </button>
              <button
                type="submit"
                onMouseEnter={() => setActive(true)}
                onMouseLeave={() => setActive(false)}
                styleName="signup-btn"
              >
                <span styleName="text">Sign up</span>
              </button>
            </div>
          </form>
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
