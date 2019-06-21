import './login.module.scss';

import { FormGroup, FormNotification } from '../../components/form';
import React, { useContext, useEffect, useState } from 'react';

import Button from '../../components/btn';
import { LoginContext } from './index';
import TwoFactorInput from '../../components/2fa';
import { navigate } from 'gatsby';

export default () => {
  const { state, dispatch } = useContext(LoginContext);
  const [isLoading, setLoading] = useState(false);
  const [is2faVerified, set2faVerified] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    if (is2faVerified) {
      navigate('/app');
    } else {
      dispatch({ type: 'set-error', data: 'Code is incorrect' });
    }
  }

  useEffect(
    () => {
      if (is2faVerified) {
        navigate('/app');
      }
    },
    [is2faVerified]
  );

  return (
    <form
      id="2fa-form"
      styleName="two-fa-form"
      onSubmit={onSubmit}
      method="post"
    >
      <input
        // Password forms should have (optionally hidden) username fields
        // they need to be type text and hidden with CSS
        style={{ display: 'none' }}
        type="text"
        value={state.email}
        autoComplete="username"
      />
      <FormGroup fluid>
        <TwoFactorInput
          onLoading={setLoading}
          onComplete={isVerified => set2faVerified(isVerified)}
        />
      </FormGroup>
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
          disabled={isLoading}
        >
          <span styleName="text">Back</span>
        </Button>
        <Button
          type="submit"
          as="button"
          loading={isLoading}
          style={{ width: 150 }}
          onMouseEnter={() => dispatch({ type: 'set-active', data: true })}
          onMouseLeave={() => dispatch({ type: 'set-active', data: false })}
          styleName="signup-btn"
        >
          <span styleName="text">Verify</span>
        </Button>
      </div>
    </form>
  );
};
