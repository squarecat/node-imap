import './login.module.scss';

import { FormGroup, FormInput, FormLabel } from '../../components/form';
import React, { useContext, useRef } from 'react';

import { LoginContext } from './index';
import PasswordInput from '../../components/form/password';

export default ({
  checkIfPwned = true,
  confirm = false,
  submitText = 'Login',
  submitAction = '/auth/login'
}) => {
  const { state, dispatch } = useContext(LoginContext);

  const matchPass = useRef(null);

  async function submit() {
    dispatch({ type: 'set-loading', data: true });
  }

  return (
    <form
      id="signup-form"
      styleName="sign-up-form"
      action={submitAction}
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
          <p>{state.message}</p>
        </div>
      ) : null}
      <div styleName="signup-buttons">
        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'set-step', data: 'enter-email' });
          }}
          onMouseEnter={() => dispatch({ type: 'set-active', data: true })}
          onMouseLeave={() => dispatch({ type: 'set-active', data: false })}
          styleName="signup-btn back-btn"
        >
          <span styleName="text">Back</span>
        </button>
        <button
          type="submit"
          onMouseEnter={() => dispatch({ type: 'set-active', data: true })}
          onMouseLeave={() => dispatch({ type: 'set-active', data: false })}
          styleName="signup-btn"
        >
          <span styleName="text">{submitText}</span>
        </button>
      </div>
    </form>
  );
};
