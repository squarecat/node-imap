import '../login/login.module.scss';

import React, { createContext, useReducer, useRef } from 'react';

import AuthButton from './auth-btn';
import EmailForm from './email';
import { FormNotification } from '../../components/form';
import Layout from '../../layouts/layout';
import { Link } from 'gatsby';
import PasswordForm from './password';
import { TextImportant } from '../../components/text';
import TwoFactorForm from './2fa';
import cx from 'classnames';
import { getAuthError } from '../../utils/errors';

const logoUrl = `${process.env.CDN_URL}/images/meta/logo.png`;

let error;
let strategy;
let username = '';
let defaultStep = 'select';
let previousProvider;
let previousUsername;

if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  error = urlParams.get('error');
  strategy = urlParams.get('strategy');
  username = urlParams.get('username');
  previousProvider = getCookie('remember-me-provider');
  previousUsername = getCookie('remember-me-username');
  if (previousUsername) {
    previousUsername = decodeURIComponent(previousUsername);
  }
}

function resetUrlParams(action) {
  if (typeof window !== 'undefined') {
    window.history.replaceState({}, '', `/${action}`);
  }
  error = null;
}

if (strategy === 'password') {
  defaultStep = 'enter-email';
} else if (strategy === 'reset') {
  defaultStep = 'reset-password';
} else if (strategy === 'signup') {
  defaultStep = 'signup';
}

const selectCardHeight = 690;
const loginEmailCardHeight = 480;
const loginWithPasswordHeight = 550;
const loginNewUserHeight = 580;
const existingStratHeight = 460;
const twoFactorAuthHeight = 410;
const forgotPasswordHeight = 480;
const resetPasswordHeight = 640;

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
      resetUrlParams(state.register ? 'signup' : 'login');

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
    case 'set-reset-code':
      return { ...state, resetCode: action.data };
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
  email: username || previousProvider === 'password' ? previousUsername : '',
  resetCode: '',
  error,
  existingProvider: null
};

export const LoginContext = createContext({ state: initialState });

const LoginPage = ({ register, transitionStatus, step = defaultStep }) => {
  const activeRef = useRef(null);
  const [state, dispatch] = useReducer(loginReducer, {
    ...initialState,
    register: !!register,
    step
  });

  let windowHeight;
  if (state.step === 'signup') {
    windowHeight = loginNewUserHeight;
  } else if (state.step === 'enter-password') {
    windowHeight = loginWithPasswordHeight;
  } else if (state.step === 'enter-email') {
    windowHeight = loginEmailCardHeight;
  } else if (state.step === 'select-existing') {
    windowHeight = existingStratHeight;
  } else if (state.step === '2fa') {
    windowHeight = twoFactorAuthHeight;
  } else if (state.step === 'forgot-password') {
    windowHeight = forgotPasswordHeight;
  } else if (state.step === 'reset-password') {
    windowHeight = resetPasswordHeight;
  } else {
    windowHeight = selectCardHeight;
  }
  if (state.error) {
    windowHeight = windowHeight + 50;
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
            <div
              styleName="login-boxy-box"
              data-active={state.step === 'select'}
            >
              {state.step === 'select' ? (
                <>
                  <div styleName="beautiful-logo">
                    <img src={logoUrl} alt="Leave Me Alone logo" />
                  </div>
                  <h1 styleName="title">{`${action} to Leave Me Alone`}</h1>
                  <p>
                    Google and Microsoft authorize Leave Me Alone without a
                    password.
                  </p>
                  <div styleName="buttons">
                    {authButtons({ dispatch, action })}
                  </div>
                  {register ? (
                    <p style={{ marginBottom: '10px' }}>
                      Already have an account?{' '}
                      {/* <Link state={{ fromSignup: true }} to="/login">
                        Log in
                      </Link> */}
                      <a styleName="switch-link" href="/login">
                        Log in
                      </a>
                      .
                    </p>
                  ) : (
                    <p style={{ marginBottom: '10px' }}>
                      Don't have an account yet?{' '}
                      {/* <Link state={{ fromLogin: true }} to="/signup">
                        Sign up
                      </Link> */}
                      <a styleName="switch-link" href="/signup">
                        Sign up
                      </a>
                      .
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
              data-active={state.step === 'enter-email'}
            >
              {state.step === 'enter-email' ? (
                <>
                  <div styleName="beautiful-logo">
                    <img src={logoUrl} alt="Leave Me Alone logo" />
                  </div>
                  <h1 styleName="title">{`${action} to Leave Me Alone`}</h1>
                  <p>You're one step away from a clean inbox!</p>
                  <EmailForm />
                </>
              ) : null}
            </div>
            <div
              styleName="new-user-login-box"
              data-active={state.step === 'signup'}
            >
              {state.step === 'signup' ? (
                <>
                  <div styleName="beautiful-logo">
                    <img src={logoUrl} alt="Leave Me Alone logo" />
                  </div>
                  <h1 styleName="title">Welcome to Leave Me Alone!</h1>
                  <p>
                    Signing up with{' '}
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
              data-active={state.step === 'enter-password'}
            >
              {state.step === 'enter-password' ? (
                <>
                  <div styleName="beautiful-logo">
                    <img src={logoUrl} alt="Leave Me Alone logo" />
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
            <div
              styleName="forgot-password-box"
              data-active={state.step === 'forgot-password'}
            >
              {state.step === 'forgot-password' ? (
                <>
                  <div styleName="beautiful-logo">
                    <img src={logoUrl} alt="Leave Me Alone logo" />
                  </div>
                  <h1 styleName="title">Forgot Password</h1>
                  <p>We will email you a password reset code.</p>
                  <EmailForm nextText="Send" />
                </>
              ) : null}
            </div>
            <div
              styleName="reset-password-box"
              data-active={state.step === 'reset-password'}
            >
              {state.step === 'reset-password' ? (
                <>
                  <div styleName="beautiful-logo">
                    <img src={logoUrl} alt="Leave Me Alone logo" />
                  </div>
                  <h1 styleName="title">Reset Password</h1>
                  <p>
                    Reset password for{' '}
                    <TextImportant>{state.email}</TextImportant>
                  </p>
                  <PasswordForm
                    autoComplete="new-password"
                    confirm={true}
                    reset={true}
                    checkPwned={true}
                    submitAction="/auth/reset"
                  />
                </>
              ) : null}
            </div>
            <div styleName="two-factor-box" data-active={state.step === '2fa'}>
              {state.step === '2fa' ? (
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
              data-active={state.step === 'select-existing'}
            >
              <div styleName="beautiful-logo">
                <img src={logoUrl} alt="Leave Me Alone logo" />
              </div>
              <h1 styleName="title">Login to Leave Me Alone</h1>
              {/* {state.existingProvider === 'connected-account' ? (
                <>
                  <p>
                    That email address already attached to another account, if
                    you want to use it for password login then first remove it
                    from the other account.
                  </p>
                </>
              ) : ( */}
              <>
                <p>
                  That email address has already been used to sign in with{' '}
                  <span styleName="provider-label">
                    {state.existingProvider}
                  </span>
                  .
                </p>
                <div styleName="existing-provider-btn">
                  <AuthButton
                    provider={state.existingProvider}
                    action={action}
                  />
                </div>
              </>
              {/* )} */}

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

  const params = new URLSearchParams(window.location.search);
  const reason = params.get('reason');
  const id = params.get('id');

  const errContent = getAuthError({ id, reason });

  return (
    <FormNotification error fluid>
      {errContent}
    </FormNotification>
  );
}

function authButtons({ dispatch, action }) {
  const btns = [
    {
      type: 'password',
      el: (
        <a
          key="pw"
          onClick={() => dispatch({ type: 'set-step', data: 'enter-email' })}
          onMouseEnter={() => dispatch({ type: 'set-active', data: true })}
          onMouseLeave={() => dispatch({ type: 'set-active', data: false })}
          styleName="login-me-in-dammit"
        >
          <span
            style={{ marginLeft: 0, textAlign: 'center' }}
            styleName="text"
          >{`${action} with Password`}</span>
        </a>
      )
    },
    {
      type: 'google',
      el: <AuthButton action={action} provider="google" />
    },
    {
      type: 'outlook',
      el: <AuthButton action={action} provider="outlook" />
    }
  ];
  let content;
  if (previousProvider) {
    content = (
      <span styleName="last-login">Last time you logged in with...</span>
    );
  }
  return (
    <>
      {content}
      {btns
        .sort(a => (a.type === previousProvider ? -1 : 1))
        .map(b => (
          <span key={b.type}>{b.el}</span>
        ))}
    </>
  );
}

function getCookie(name) {
  var value = '; ' + document.cookie;
  var parts = value.split('; ' + name + '=');
  if (parts.length == 2)
    return parts
      .pop()
      .split(';')
      .shift();
}
