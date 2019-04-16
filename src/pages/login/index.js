import '../login/login.module.scss';

import React, { createContext, useReducer, useRef } from 'react';

import AuthButton from './auth-btn';
import EmailForm from './email';
import Layout from '../../layouts/layout';
import PasswordForm from './password';
import cx from 'classnames';
import logo from '../../assets/envelope-logo.png';

let error;
let strategy;
let message;
let username = '';
let defaultStep = 'select';

if (typeof URLSearchParams !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  error = urlParams.get('error');
  strategy = urlParams.get('strategy');
  message = urlParams.get('message');
  username = urlParams.get('username');
}

if (strategy === 'password') {
  defaultStep = 'enter-email';
}

const selectCardHeight = 690;
const loginEmailCardHeight = 480;
const loginWithPasswordHeight = 550;
const loginNewUserHeight = 580;
const existingStratHeight = 470;

// steps;
// 1. select-strategy
//    the first page when the user arrives,
//    shows a list of the sign in strategies
// 2. password-strategy
//    the pw form
function loginReducer(state, action) {
  const { type, data } = action;
  switch (type) {
    case 'set-loading':
      return { ...state, loading: data };
    case 'set-step': {
      if (action.data === 'select') {
        return {
          ...state,
          step: action.data,
          error: false,
          newUser: false,
          requirePassword: false
        };
      }
      return { ...state, step: action.data };
    }
    case 'set-password':
      return { ...state, password: action.data };
    case 'set-email':
      return { ...state, email: action.data };
    case 'set-error':
      return { ...state, error: action.data };
    case 'set-active':
      return { ...state, isActive: action.data };
    case 'set-existing-provider':
      return { ...state, existingProvider: action.data };
    default:
      return state;
  }
}

const initialState = {
  loading: false,
  step: defaultStep,
  password: '',
  email: username,
  error,
  newUser: false,
  requirePassword: false,
  message,
  existingProvider: null
};

export const LoginContext = createContext({ state: initialState });

const LoginPage = () => {
  const activeRef = useRef(null);
  const [state, dispatch] = useReducer(loginReducer, initialState);
  const { step } = state;

  let windowHeight;
  if (step === 'signup') {
    windowHeight = loginNewUserHeight;
  } else if (step === 'enter-password') {
    windowHeight = loginWithPasswordHeight;
  } else if (step === 'enter-email') {
    windowHeight = loginEmailCardHeight;
  } else if (step === 'select-existing') {
    windowHeight = existingStratHeight;
  } else {
    windowHeight = selectCardHeight;
  }
  if (state.error) {
    windowHeight = windowHeight + 40;
  }

  const classes = cx('hold-onto-your-butts-we-are-logging-in', {
    errored: !!state.error
  });

  return (
    <Layout page="Login">
      <LoginContext.Provider value={{ state, dispatch }}>
        <div ref={activeRef} styleName={classes}>
          <div styleName="card-flip" style={{ maxHeight: windowHeight }}>
            <div styleName="login-boxy-box" data-active={step === 'select'}>
              <div styleName="beautiful-logo">
                <img src={logo} alt="logo" />
              </div>
              <h1 styleName="title">Login to Leave Me Alone</h1>
              <p>
                Google and Outlook authorize Leave Me Alone without a password.
              </p>
              {/* <p>
            Although we inspect your mail in order to find your subscriptions,
            unlike other services we <TextBold>NEVER</TextBold> store any of the
            content of your mail or any other private information!
          </p> */}
              <div styleName="buttons">
                <a
                  onClick={() =>
                    dispatch({ type: 'set-step', data: 'enter-email' })
                  }
                  onMouseEnter={() =>
                    dispatch({ type: 'set-active', data: true })
                  }
                  onMouseLeave={() =>
                    dispatch({ type: 'set-active', data: false })
                  }
                  styleName="login-me-in-dammit"
                >
                  <span styleName="text">Login with Password</span>
                </a>
                <AuthButton provider="google" />
                <AuthButton provider="outlook" />
              </div>
              {getError(error)}
              <p styleName="notice">
                We will use your email to very occassionally send you product
                updates. You can opt-out at any time. We will NEVER share it
                with anyone, for any reason, EVER.
              </p>
            </div>
            <div
              styleName="email-login-box"
              data-active={step === 'enter-email'}
            >
              <div styleName="beautiful-logo">
                <img src={logo} alt="logo" />
              </div>
              <h1 styleName="title">Login to Leave Me Alone</h1>
              <p>You're one step away from a clean inbox!</p>
              <EmailForm />
            </div>
            <div styleName="new-user-login-box" data-active={step === 'signup'}>
              <div styleName="beautiful-logo">
                <img src={logo} alt="logo" />
              </div>
              <h1 styleName="title">Welcome to Leave Me Alone!</h1>
              <p>
                Signing in with{' '}
                <span styleName="email-label">{state.email}</span>
              </p>

              <PasswordForm
                confirm={true}
                checkPwned={true}
                submitAction="/auth/signup"
              />
            </div>
            <div
              styleName="existing-user-login-box"
              data-active={step === 'enter-password'}
            >
              <div styleName="beautiful-logo">
                <img src={logo} alt="logo" />
              </div>
              <h1 styleName="title">Login to Leave Me Alone</h1>
              <p>Welcome back!</p>
              <p>
                Signing in with{' '}
                <span styleName="email-label">{state.email}</span>
              </p>
              <PasswordForm
                confirm={false}
                submitAction="/auth/login"
                checkIfPwned={false}
              />
            </div>
            <div
              styleName="existing-user-suggestion-box"
              data-active={step === 'select-existing'}
            >
              <div styleName="beautiful-logo">
                <img src={logo} alt="logo" />
              </div>
              <h1 styleName="title">Login to Leave Me Alone</h1>
              <p>
                That email address has already been used to sign in with{' '}
                <span styleName="provider-label">{state.existingProvider}</span>
              </p>
              <div styleName="existing-provider-btn">
                <AuthButton provider={state.existingProvider} />
              </div>
              <div styleName="signup-buttons">
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'set-step', data: 'select' });
                  }}
                  onMouseEnter={() =>
                    dispatch({ type: 'set-active', data: true })
                  }
                  onMouseLeave={() =>
                    dispatch({ type: 'set-active', data: false })
                  }
                  styleName="signup-btn back-btn"
                >
                  <span styleName="text">Back</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </LoginContext.Provider>
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
