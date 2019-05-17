import './login.module.scss';

import { FormGroup, FormInput, FormLabel } from '../../components/form';
import React, { useContext } from 'react';

import Button from '../../components/btn';
import Hashes from 'jshashes';
import { LoginContext } from './index';

export default () => {
  const { state, dispatch } = useContext(LoginContext);

  async function submit(e) {
    e.preventDefault();
    try {
      dispatch({ type: 'set-loading', data: true });
      const userStrat = await getUserLoginStrategy(state.email);
      if (userStrat === 'password') {
        dispatch({ type: 'set-step', data: 'enter-password' });
      } else if (!userStrat) {
        dispatch({ type: 'set-step', data: 'signup' });
      } else {
        dispatch({ type: 'set-step', data: 'select-existing' });
        dispatch({ type: 'set-existing-provider', data: userStrat });
      }
    } catch (err) {
      dispatch({ type: 'set-loading', data: false });
      dispatch({
        type: 'set-error',
        data:
          'Something went wrong. Please try again or send us a message for help!'
      });
    }
  }
  return (
    <form id="email-form" styleName="sign-up-form" onSubmit={submit}>
      <FormGroup fluid>
        <FormLabel htmlFor="username">Enter your email address...</FormLabel>
        <FormInput
          noFocus
          compact
          type="email"
          placeholder=""
          name="username"
          id="username"
          required
          autoComplete="username"
          onChange={({ currentTarget }) => {
            dispatch({ type: 'set-email', data: currentTarget.value });
          }}
          value={state.email}
        />
      </FormGroup>
      {state.error ? (
        <div styleName="error">
          <p>{state.message || state.error}</p>
        </div>
      ) : null}
      <div styleName="signup-buttons">
        <Button
          as="button"
          onClick={() => {
            dispatch({ type: 'set-step', data: 'select' });
          }}
          onMouseEnter={() => dispatch({ type: 'set-active', data: true })}
          onMouseLeave={() => dispatch({ type: 'set-active', data: false })}
          styleName="signup-btn back-btn"
          style={{ width: 150 }}
          muted
          outlined
          disabled={state.loading}
        >
          <span styleName="text">Back</span>
        </Button>

        <Button
          as="button"
          type="submit"
          onMouseEnter={() => dispatch({ type: 'set-active', data: true })}
          onMouseLeave={() => dispatch({ type: 'set-active', data: false })}
          styleName="signup-btn"
          loading={state.loading}
          style={{ width: 150 }}
        >
          <span styleName="text">Next</span>
        </Button>
      </div>
    </form>
  );
};

async function getUserLoginStrategy(username) {
  const userDigest = new Hashes.SHA1().hex(username);
  // TODO use utils/request instead
  const resp = await fetch(`/api/user/${userDigest}/provider`);
  if (resp.status === 404) {
    return null;
  } else if (resp.status === 200) {
    return resp.text();
  }
  throw new Error('Request failed');
}
