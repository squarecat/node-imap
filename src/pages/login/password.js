import './login.module.scss';

import { FormGroup, FormInput, FormLabel } from '../../components/form';
import React, { useContext, useRef } from 'react';

import Button from '../../components/btn';
import { LoginContext } from './index';
import PasswordInput from '../../components/form/password';
import { navigate } from 'gatsby';

export default ({
  checkIfPwned = true,
  confirm = false,
  submitText = 'Login',
  submitAction = '/auth/login'
}) => {
  const { state, dispatch } = useContext(LoginContext);

  const matchPass = useRef(null);

  async function onSubmit(e) {
    e.preventDefault();
    const { password, email } = state;
    dispatch({ type: 'set-loading', data: true });
    const resp = await fetch(submitAction, {
      method: 'POST',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ username: email, password })
    });
    const { success, message, twoFactorRequired } = await resp.json();
    if (success !== true) {
      dispatch({ type: 'set-loading', data: false });
      return dispatch({ type: 'set-error', data: message });
    } else if (twoFactorRequired) {
      return dispatch({ type: 'set-step', data: '2fa' });
    } else {
      return navigate('/app');
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
      <input type="hidden" name="username" value={state.email} />
      <FormGroup fluid>
        <FormLabel htmlFor="password">Password</FormLabel>
        <PasswordInput
          checkIfPwned={checkIfPwned}
          onChange={password =>
            dispatch({ type: 'set-password', data: password })
          }
        />
      </FormGroup>
      {confirm ? (
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
              value === state.password ? true : 'Passwords must match.'
            }
          />
        </FormGroup>
      ) : (
        <a
          onClick={() =>
            dispatch({ type: 'set-step', data: 'forgot-password' })
          }
          styleName="forgot-password"
        >
          Forgot password?
        </a>
      )}

      {state.error ? (
        <div styleName="error">
          <p>{state.error}</p>
        </div>
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
