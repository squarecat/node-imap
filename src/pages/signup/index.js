import { FormGroup, FormInput, FormLabel } from '../../components/form';
import { GoogleIcon, OutlookIcon } from '../../components/icons';
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
