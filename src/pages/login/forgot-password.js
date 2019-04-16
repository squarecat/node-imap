import './login.module.scss';

import { FormGroup, FormInput, FormLabel } from '../../components/form';
import React, { useContext, useRef } from 'react';

import { LoginContext } from './index';
import PasswordInput from '../../components/form/password';

export default () => {
  const { state, dispatch } = useContext(LoginContext);

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
      <p>
        We've sent a confirmation code to your email address{' '}
        <span styleName="email-label">{state.email}</span>.
      </p>
      <input type="hidden" name="email" value={state.email} />
      <FormGroup fluid />
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
          type="button"
          onClick={() => submit()}
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
