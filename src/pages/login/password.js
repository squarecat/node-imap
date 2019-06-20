import './login.module.scss';

import {
  FormGroup,
  FormInput,
  FormLabel,
  FormNotification
} from '../../components/form';
import React, { useContext } from 'react';

import Button from '../../components/btn';
import { LoginContext } from './index';
import PasswordInput from '../../components/form/password';
import { getAuthError } from '../../utils/errors';
import { navigate } from 'gatsby';

export default ({
  doValidation = true,
  confirm = false,
  reset = false,
  submitText = 'Login',
  submitAction = '/auth/login',
  autoComplete
}) => {
  const { state, dispatch } = useContext(LoginContext);

  async function onSubmit(e) {
    try {
      e.preventDefault();
      const { password, email, resetCode } = state;
      dispatch({ type: 'set-loading', data: true });
      // TODO use request instead
      const resp = await fetch(submitAction, {
        method: 'POST',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({ username: email, password, resetCode })
      });
      const { success, error, twoFactorRequired } = await resp.json();
      if (success !== true) {
        throw error;
      } else if (twoFactorRequired) {
        return dispatch({ type: 'set-step', data: '2fa' });
      } else {
        return navigate('/app');
      }
    } catch (err) {
      dispatch({ type: 'set-loading', data: false });
      let type = 'login';
      if (confirm) type = 'signup';
      if (reset) type = 'reset';
      const message = getAuthError(err, type);
      return dispatch({ type: 'set-error', data: message });
    }
  }

  return (
    <form
      id="signup-form"
      styleName="sign-up-form"
      action={submitAction}
      onSubmit={onSubmit}
      method="post"
    >
      {reset ? (
        <FormGroup fluid>
          <FormLabel htmlFor="reset-code">Reset code</FormLabel>
          <FormInput
            autoFocus
            id="reset-code"
            name="reset-code"
            required
            compact
            onChange={({ currentTarget }) =>
              dispatch({ type: 'set-reset-code', data: currentTarget.value })
            }
          />
        </FormGroup>
      ) : null}
      <input
        // Password forms should have (optionally hidden) username fields
        // they need to be type text and hidden with CSS
        style={{ display: 'none' }}
        type="text"
        value={state.email}
        onChange={() => {}}
        autoComplete="username"
      />
      <FormGroup fluid>
        <FormLabel htmlFor="password">Password</FormLabel>
        <PasswordInput
          autoComplete={autoComplete}
          doValidation={doValidation}
          onChange={password =>
            dispatch({ type: 'set-password', data: password })
          }
        />
      </FormGroup>
      {confirm ? (
        <FormGroup fluid>
          <FormLabel htmlFor="password-confirm">Confirm password</FormLabel>
          <FormInput
            id="password-confirm"
            type="password"
            name="password-confirm"
            autoComplete={autoComplete}
            required
            compact
            validation={value =>
              value === state.password ? true : 'Passwords must match.'
            }
          />
        </FormGroup>
      ) : (
        <FormGroup fluid>
          <a
            onClick={() =>
              dispatch({ type: 'set-step', data: 'forgot-password' })
            }
            styleName="forgot-password"
          >
            Forgot password?
          </a>
        </FormGroup>
      )}

      {state.error ? (
        <FormNotification error fluid>
          {state.error}
        </FormNotification>
      ) : null}
      <div styleName="signup-buttons">
        <Button
          onClick={() => {
            dispatch({ type: 'set-step', data: 'enter-email' });
          }}
          muted
          outlined
          as="button"
          style={{ width: 150 }}
          onMouseEnter={() => dispatch({ type: 'set-active', data: true })}
          onMouseLeave={() => dispatch({ type: 'set-active', data: false })}
          disabled={state.loading}
        >
          <span styleName="text">Back</span>
        </Button>
        <Button
          type="submit"
          as="button"
          style={{ width: 150 }}
          onMouseEnter={() => dispatch({ type: 'set-active', data: true })}
          onMouseLeave={() => dispatch({ type: 'set-active', data: false })}
          styleName="signup-btn"
          loading={state.loading}
        >
          <span styleName="text">{submitText}</span>
        </Button>
      </div>
    </form>
  );
};
