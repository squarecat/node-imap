import '../login/login.module.scss';

import React, { createContext, useReducer, useRef } from 'react';

import AuthButton from './auth-btn';
import EmailForm from './email';
import Layout from '../../layouts/layout';
import { Link } from 'gatsby';
import PasswordForm from './password';
import TwoFactorForm from './2fa';
import cx from 'classnames';
import logo from '../../assets/envelope-logo.png';

let error;
let strategy;
let username = '';
let defaultStep = 'select';

if (typeof URLSearchParams !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  error = urlParams.get('error');
  strategy = urlParams.get('strategy');
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
      return {
        ...state,
        step: action.data,
        loading: false,
        error: false
      };
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
  register: false,
  password: '',
  email: username || '',
  error,
  existingProvider: null
};

export const LoginContext = createContext({ state: initialState });

const LoginPage = ({ register, transitionStatus }) => {
  const activeRef = useRef(null);
  const [state, dispatch] = useReducer(loginReducer, {
    ...initialState,
    register: !!register
  });

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
  } else if (step === '2fa') {
    windowHeight = 410;
  } else {
    windowHeight = selectCardHeight;
  }
  if (state.error) {
    windowHeight = windowHeight + 40;
  }

  const classes = cx('hold-onto-your-butts-we-are-logging-in', {
    errored: !!state.error
  });
  const action = register ? 'Sign up' : 'Login';

  return (
    <Layout page={action}>
      <LoginContext.Provider value={{ state, dispatch }}>
        <div ref={activeRef} styleName={classes} data-status={transitionStatus}>
          <div
            styleName="card-flip"
            style={{ maxHeight: windowHeight }}
            data-status={transitionStatus}
          >
            <div styleName="login-boxy-box" data-active={step === 'select'}>
              {step === 'select' ? (
                <>
                  <div styleName="beautiful-logo">
                    <img src={logo} alt="logo" />
                  </div>
                  <h1 styleName="title">{`${action} to Leave Me Alone`}</h1>
                  <p>
                    Google and Outlook authorize Leave Me Alone without a
                    password.
                  </p>
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
                      <span
                        style={{ marginLeft: 0, textAlign: 'center' }}
                        styleName="text"
                      >{`${action} with Password`}</span>
                    </a>
                    <AuthButton action={action} provider="google" />
                    <AuthButton action={action} provider="outlook" />
                  </div>
                  {register ? (
                    <p>
                      Already have an account? <a href="/login">Sign in</a>.
                    </p>
                  ) : (
                    <p>
                      Don't have an account yet? <a href="/signup">Sign up</a>.
                    </p>
                  )}

                  {getError(error)}
                  <p styleName="notice">
                    We will use your email to very occassionally send you
                    product updates. You can opt-out at any time. We will NEVER
                    share it with anyone, for any reason, EVER.
                  </p>
                </>
              ) : null}
            </div>
            <div
              styleName="email-login-box"
              data-active={step === 'enter-email'}
            >
              {step === 'enter-email' ? (
                <>
                  <div styleName="beautiful-logo">
                    <img src={logo} alt="logo" />
                  </div>
                  <h1 styleName="title">{`${action} to Leave Me Alone`}</h1>
                  <p>You're one step away from a clean inbox!</p>
                  <EmailForm />
                </>
              ) : null}
            </div>
            <div styleName="new-user-login-box" data-active={step === 'signup'}>
              {step === 'signup' ? (
                <>
                  <div styleName="beautiful-logo">
                    <img src={logo} alt="logo" />
                  </div>
                  <h1 styleName="title">Welcome to Leave Me Alone!</h1>
                  <p>
                    Signing in with{' '}
                    <span styleName="email-label">{state.email}</span>
                  </p>

                  <PasswordForm
                    autoComplete="new-password"
                    confirm={true}
                    checkPwned={true}
                    submitAction="/auth/signup"
                  />
                </>
              ) : null}
            </div>
            <div
              styleName="existing-user-login-box"
              data-active={step === 'enter-password'}
            >
              {step === 'enter-password' ? (
                <>
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
                    autoComplete="current-password"
                    submitAction="/auth/login"
                    doValidation={false}
                  />
                </>
              ) : null}
            </div>
            <div styleName="two-factor-box" data-active={step === '2fa'}>
              {step === '2fa' ? (
                <>
                  <h1 styleName="title">Two-factor Auth Required</h1>
                  <p>
                    Signing in with{' '}
                    <span styleName="email-label">{state.email}</span>
                  </p>
                  <p>
                    Open your authentication app and enter the code for Leave Me
                    Alone.
                  </p>
                  <TwoFactorForm />
                </>
              ) : null}
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
