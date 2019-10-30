import '../login/login.module.scss';

import { AtSignIcon, KeyIcon } from '../../components/icons';
import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef
} from 'react';
import { TextImportant, TextLink } from '../../components/text';

import AuthButton from './auth-btn';
import EmailForm from './email';
import { FormNotification } from '../../components/form';
import Layout from '../../layouts/layout';
import PasswordForm from './password';
import TwoFactorForm from './2fa';
import cx from 'classnames';
import { getAuthError } from '../../utils/errors';

const logoUrl = `${process.env.CDN_URL}/images/meta/logo.png`;

const isMaintenanceMode = false;

function resetUrlParams(action, teams) {
  if (typeof window !== 'undefined') {
    let newState = {};
    let url = `/${action}`;
    if (teams) {
      newState = {
        teams: true
      };
      url = `${url}?teams=true`;
    }
    window.history.replaceState(newState, '', url);
  }
}

const selectCardHeight = 690;
const loginEmailCardHeight = 480;
const loginWithPasswordHeight = 550;
const loginNewUserHeight = 580;
const existingStratHeight = 460;
const twoFactorAuthHeight = 520;
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
      resetUrlParams(state.register ? 'signup' : 'login', state.teams);
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
    case 'set-existing-provider':
      return { ...state, existingProvider: action.data };
    case 'set-provider-intent':
      return { ...state, providerIntent: action.data };
    case 'reset':
      return action.data;
    default:
      return state;
  }
}

const initialState = {
  loading: false,
  register: false,
  password: '',
  email: '',
  resetCode: '',
  teams: false,
  error: false,
  existingProvider: null
};

export const LoginContext = createContext({ state: initialState });

const LoginPage = React.memo(
  ({ register, transitionStatus, step = 'select' }) => {
    const activeRef = useRef(null);
    const [state, dispatch] = useReducer(loginReducer, {
      ...initialState,
      step
    });

    useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);

      const previousProvider = getCookie('remember-me-provider');
      let previousUsername = getCookie('remember-me-username');
      let defaultStep = 'select';
      if (previousUsername) {
        previousUsername = decodeURIComponent(previousUsername);
      }
      const username = urlParams.get('username');
      const strategy = urlParams.get('strategy');
      let email = username || '';
      if (previousProvider === 'password') {
        email = previousUsername || '';
      }
      if (strategy === 'password') {
        defaultStep = 'enter-email';
      } else if (strategy === 'reset') {
        defaultStep = 'reset-password';
      } else if (strategy === 'signup') {
        defaultStep = 'signup';
      } else if (strategy === 'forgot') {
        defaultStep = 'forgot-password';
      }

      dispatch({
        type: 'reset',
        data: {
          email,
          error: urlParams.get('error'),
          strategy,
          username,
          teams: urlParams.get('teams'),
          previousProvider,
          previousUsername,
          step: defaultStep
        }
      });
    }, []);
    const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

    const windowHeight = useMemo(() => {
      let height;
      if (state.step === 'signup') {
        height = loginNewUserHeight;
      } else if (state.step === 'enter-password') {
        height = loginWithPasswordHeight;
      } else if (
        state.step === 'enter-email' &&
        state.providerIntent === 'other'
      ) {
        height = loginEmailCardHeight + 40;
      } else if (state.step === 'enter-email') {
        height = loginEmailCardHeight;
      } else if (state.step === 'select-existing') {
        height = existingStratHeight;
      } else if (state.step === '2fa') {
        height = twoFactorAuthHeight;
      } else if (state.step === 'forgot-password') {
        height = forgotPasswordHeight;
      } else if (state.step === 'reset-password') {
        height = resetPasswordHeight;
      } else {
        height = selectCardHeight;
      }
      if (state.error) {
        height = windowHeight + 50;
      }
      return height;
    }, [state.error, state.providerIntent, state.step]);

    const classes = cx('hold-onto-your-butts-we-are-logging-in', {
      errored: !!state.error
    });
    const action = register ? 'Sign up' : 'Login';

    const style = useMemo(() => ({ maxHeight: windowHeight }), [windowHeight]);

    // FIXME this could definitely be better, but it's currently
    // contrained by the way I've done the CSS transitions, requiring
    // all the divs to be in the DOM to start with and then transition
    // into view.
    // Could probably recreate the effect with react-transition-group
    const content = useMemo(() => {
      let selectContent = null;
      let emailContent = null;
      let signupContent = null;
      let enterPasswordContent = null;
      let forgotPasswordContent = null;
      let resetPasswordContent = null;
      let twofaContent = null;
      let existingContent = null;
      if (isMaintenanceMode) {
        selectContent = (
          <>
            <h1 styleName="title">Down for maintenance</h1>
            <p>
              We're currently upgrading the Leave Me Alone system, check back in
              a little while for the updates!
            </p>
            <p>
              We'll post about our progress and updates on our Twitter page{' '}
              <a href="https://twitter.com/LeaveMeAloneApp">
                https://twitter.com/LeaveMeAloneApp
              </a>
              .
            </p>
          </>
        );
      } else if (state.step === 'select') {
        let tagline = 'Great to see you again!';
        if (state.teams) {
          tagline = `Get ready to give your team more time to focus on building your business!`;
        } else if (register) {
          tagline = null;
        }

        let switchContent;
        if (state.teams) {
          switchContent = (
            <p styleName="switch-link">
              <span>
                Already have an account? <a href="/login">Log in</a>.
              </span>
              <span>
                {' '}
                Not a team? <a href="/signup">Sign up for a personal account</a>
                .
              </span>
            </p>
          );
        } else if (register) {
          switchContent = (
            <p styleName="switch-link">
              <span>
                Already have an account? <a href="/login">Log in</a>.
              </span>
              <span>
                {' '}
                Let your entire team unsubscribe.{' '}
                <a href="/signup?teams=true">Sign up for teams</a>.
              </span>
            </p>
          );
        } else {
          switchContent = (
            <p styleName="switch-link">
              Don't have an account yet? <a href="/signup">Sign up</a>.
            </p>
          );
        }
        selectContent = (
          <>
            <h1 styleName="title">{`${action} to Leave Me Alone${
              state.teams ? ' for Teams' : ''
            }`}</h1>
            {tagline ? <p>{tagline}</p> : null}
            <div styleName="buttons">
              <AuthButtons
                dispatch={dispatch}
                action={action}
                hideOther={state.teams}
              />
            </div>
            {switchContent}
            {getError(state.error)}
            <p styleName="notice">
              We only ask for the permissions we need to operate - read more{' '}
              <TextLink href="/security" target="_">
                here
              </TextLink>
              . We will use your email to very occassionally send you product
              updates. You can opt-out at any time. We will NEVER share your
              data with anyone, for any reason, EVER.
            </p>
          </>
        );
      } else if (state.step === 'enter-email') {
        emailContent = (
          <>
            <h1 styleName="title">{`${action} to Leave Me Alone${
              state.teams ? ' for Teams' : ''
            }`}</h1>
            <p>You're one step away from a clean inbox!</p>
            <EmailForm />
          </>
        );
      } else if (state.step === 'signup') {
        signupContent = (
          <>
            <h1 styleName="title">
              Welcome to Leave Me Alone{state.teams ? ' for Teams' : ''}!
            </h1>
            <p>
              Signing up with <span styleName="email-label">{state.email}</span>
            </p>

            <PasswordForm
              autoComplete="new-password"
              confirm={true}
              checkPwned={true}
              submitAction={`/auth/signup${state.teams ? '?teams=true' : ''}`}
              submitText="Sign up"
            />
          </>
        );
      } else if (state.step === 'enter-password') {
        enterPasswordContent = (
          <>
            <h1 styleName="title">Login to Leave Me Alone</h1>
            <p>Welcome back!</p>
            <p>
              Signing in with <span styleName="email-label">{state.email}</span>
            </p>
            <PasswordForm
              confirm={false}
              autoComplete="current-password"
              submitAction="/auth/login"
              doValidation={false}
            />
          </>
        );
      } else if (state.step === 'forgot-password') {
        forgotPasswordContent = (
          <>
            <h1 styleName="title">Forgot Password</h1>
            <p>We will email you a password reset code.</p>
            <EmailForm nextText="Send" />
          </>
        );
      } else if (state.step === 'reset-password') {
        resetPasswordContent = (
          <>
            <h1 styleName="title">Reset Password</h1>
            <p>
              Reset password for <TextImportant>{state.email}</TextImportant>
            </p>
            <PasswordForm
              autoComplete="new-password"
              confirm={true}
              reset={true}
              checkPwned={true}
              submitAction="/auth/reset"
            />
          </>
        );
      } else if (state.step === '2fa') {
        twofaContent = (
          <>
            <h1 styleName="title">Two-factor Auth Required</h1>
            <p>
              Signing in with <span styleName="email-label">{state.email}</span>
            </p>
            <p>
              Open your authentication app and enter the code for Leave Me
              Alone.
            </p>
            <TwoFactorForm />
          </>
        );
      } else if (state.step === 'select-existing') {
        existingContent = (
          <>
            <h1 styleName="title">Login to Leave Me Alone</h1>
            {state.existingProvider === 'connected-account' ? (
              <p>
                That email address is already attached to another account, if
                you want to use it for password login then first remove it from
                the other account.
              </p>
            ) : (
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
                    action="Login"
                  />
                </div>
              </>
            )}

            <div styleName="signup-buttons">
              <button
                type="button"
                onClick={() => dispatch({ type: 'set-step', data: 'select' })}
                styleName="signup-btn back-btn"
              >
                Back
              </button>
            </div>
          </>
        );
      }

      return (
        <>
          <div styleName="login-boxy-box" data-active={state.step === 'select'}>
            <div styleName="beautiful-logo">
              <img src={logoUrl} alt="Leave Me Alone logo" />
            </div>
            {selectContent}
          </div>
          <div
            styleName="email-login-box"
            data-active={state.step === 'enter-email'}
          >
            <div styleName="beautiful-logo">
              <img src={logoUrl} alt="Leave Me Alone logo" />
            </div>
            {emailContent}
          </div>
          <div
            styleName="new-user-login-box"
            data-active={state.step === 'signup'}
          >
            <div styleName="beautiful-logo">
              <img src={logoUrl} alt="Leave Me Alone logo" />
            </div>
            {signupContent}
          </div>
          <div
            styleName="existing-user-login-box"
            data-active={state.step === 'enter-password'}
          >
            <div styleName="beautiful-logo">
              <img src={logoUrl} alt="Leave Me Alone logo" />
            </div>
            {enterPasswordContent}
          </div>
          <div
            styleName="forgot-password-box"
            data-active={state.step === 'forgot-password'}
          >
            <div styleName="beautiful-logo">
              <img src={logoUrl} alt="Leave Me Alone logo" />
            </div>
            {forgotPasswordContent}
          </div>
          <div
            styleName="reset-password-box"
            data-active={state.step === 'reset-password'}
          >
            <div styleName="beautiful-logo">
              <img src={logoUrl} alt="Leave Me Alone logo" />
            </div>
            {resetPasswordContent}
          </div>
          <div styleName="two-factor-box" data-active={state.step === '2fa'}>
            <div styleName="beautiful-logo">
              <img src={logoUrl} alt="Leave Me Alone logo" />
            </div>
            {twofaContent}
          </div>
          <div
            styleName="existing-user-suggestion-box"
            data-active={state.step === 'select-existing'}
          >
            <div styleName="beautiful-logo">
              <img src={logoUrl} alt="Leave Me Alone logo" />
            </div>
            {existingContent}
          </div>
        </>
      );
    }, [
      action,
      register,
      state.email,
      state.error,
      state.existingProvider,
      state.step,
      state.teams
    ]);

    return (
      <Layout title={action} slug={register ? '/signup' : '/login'}>
        <LoginContext.Provider value={value}>
          <div
            ref={activeRef}
            styleName={classes}
            data-status={transitionStatus}
          >
            <div
              styleName="card-flip"
              style={style}
              data-status={transitionStatus}
            >
              {content}
            </div>
          </div>
        </LoginContext.Provider>
      </Layout>
    );
  }
);

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

const AuthButtons = React.memo(({ dispatch, action, hideOther }) => {
  const btns = useMemo(() => {
    let buttons = [
      {
        type: 'password',
        el: (
          <a
            key="pw"
            onClick={() => {
              dispatch({ type: 'set-provider-intent', data: 'password' });
              dispatch({ type: 'set-step', data: 'enter-email' });
            }}
            styleName="login-me-in-dammit"
          >
            <KeyIcon inline />
            <span>{`${action} with Password`}</span>
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

    if (action === 'Sign up' && !hideOther) {
      buttons = [
        ...buttons,
        {
          type: 'other',
          el: (
            <a
              key="other"
              onClick={() => {
                dispatch({ type: 'set-provider-intent', data: 'other' });
                dispatch({ type: 'set-step', data: 'enter-email' });
              }}
              styleName="login-me-in-dammit"
            >
              <AtSignIcon />
              <span>{`Other email provider...`}</span>
            </a>
          )
        }
      ];
    }

    return buttons.map(b => <span key={b.type}>{b.el}</span>);
  }, [action, dispatch, hideOther]);
  // let content = null;
  // if (previousProvider) {
  //   content = (
  //     <span styleName="last-login">Last time you logged in with...</span>
  //   );
  // }
  return (
    <>
      {/* {content} */}
      {btns}
    </>
  );
});

function getCookie(name) {
  var value = '; ' + document.cookie;
  var parts = value.split('; ' + name + '=');
  if (parts.length == 2)
    return parts
      .pop()
      .split(';')
      .shift();
}
