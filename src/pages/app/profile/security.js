import './security.module.scss';

import {
  FormGroup,
  FormInput,
  FormLabel,
  FormNotification
} from '../../../components/form';
import React, { useState } from 'react';
import Table, { TableCell, TableRow } from '../../../components/table';

import Button from '../../../components/btn';
import PasswordInput from '../../../components/form/password';
import ProfileLayout from './layout';
import SetupTwoFactorAuthModal from '../../../components/modal/create-2fa';
import { TextImportant } from '../../../components/text';
import VerifyTwoFacorAuthModal from '../../../components/modal/verify-2fa';
import _capitalize from 'lodash.capitalize';
import request from '../../../utils/request';
import useUser from '../../../utils/hooks/use-user';

export async function updatePassword(oldPassword, password) {
  return request('/api/me/password', {
    method: 'PATCH',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      op: 'update',
      value: { oldPassword, password }
    })
  });
}

export default () => {
  const [{ loginProvider }] = useUser(u => ({
    loginProvider: u.loginProvider
  }));

  return (
    <ProfileLayout pageName="Security">
      {loginProvider === 'password' ? (
        <>
          <TwoFactorAuth />
          <ChangePassword />
        </>
      ) : (
        <div styleName="security-section">
          <h2>Switch to email & password</h2>
          <p>You currently login with {_capitalize(loginProvider)}.</p>
          <p>You can switch to email and password instead...</p>
          <p>Coming soon!</p>
        </div>
      )}
    </ProfileLayout>
  );
};

function TwoFactorAuth() {
  const [{ requiresTwoFactorAuth }, { setRequiresTwoFactorAuth }] = useUser(
    u => ({
      requiresTwoFactorAuth: u.requiresTwoFactorAuth
    })
  );

  const [is2faSetup, show2faSetup] = useState(false);
  const [is2faVerify, show2faVerify] = useState(false);

  return (
    <div styleName="security-section two-factor-auth">
      <div styleName="two-factor-auth-content">
        <h2>Two-factor Authentication</h2>
        <p>
          Two-factor authentication adds an additional layer of security to your
          account by requiring more than just a password to log in. We support
          two-facor authentication via the use of an app such as Authy or Google
          Authenticaor
        </p>
      </div>
      <Table>
        <TableRow>
          <TableCell>Authenticator app</TableCell>
          <TableCell>
            <TextImportant>
              {requiresTwoFactorAuth ? 'Enabled' : 'Disabled'}
            </TextImportant>
          </TableCell>
          <TableCell>
            {requiresTwoFactorAuth ? (
              <Button
                smaller
                compact
                muted
                basic
                onClick={() => show2faVerify(true)}
              >
                Remove
              </Button>
            ) : (
              <Button
                smaller
                compact
                muted
                basic
                onClick={() => show2faSetup(true)}
              >
                Setup
              </Button>
            )}
          </TableCell>
        </TableRow>
      </Table>
      {is2faSetup ? (
        <SetupTwoFactorAuthModal
          onClose={({ verified }) => {
            show2faSetup(false);
            if (verified) {
              setRequiresTwoFactorAuth(true);
            }
          }}
        />
      ) : null}
      {is2faVerify ? (
        <VerifyTwoFacorAuthModal
          action={token => removeTwoFactorAuth(token)}
          onClose={({ verified }) => {
            show2faVerify(false);
            if (verified) {
              setRequiresTwoFactorAuth(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}

function ChangePassword() {
  async function onSubmit() {
    setState({ ...state, loading: true });

    try {
      await updatePassword(state.oldPassword, state.password);

      return setState({
        ...state,
        oldPassword: '',
        password: '',
        confirmPassword: '',
        error: false,
        loading: false,
        success: 'Password changed'
      });
    } catch (err) {
      setState({
        ...state,
        error:
          'Something went wrong changing your password. Please try again or send us a message.',
        loading: false
      });
    }
  }

  const [state, setState] = useState({
    oldPassword: '',
    password: '',
    confirmPassword: '',
    error: false,
    loading: false
  });

  return (
    <div styleName="security-section">
      <h2>Change password</h2>
      <form
        id="change-password-form"
        styleName="change-password-form"
        onSubmit={e => {
          e.preventDefault();
          return onSubmit();
        }}
        method="post"
      >
        <FormGroup fluid>
          <FormLabel htmlFor="password">Old Password</FormLabel>
          <FormInput
            compact
            value={state.oldPassword}
            type="password"
            name="oldPassword"
            onChange={e => {
              setState({
                ...state,
                oldPassword: e.currentTarget.value
              });
            }}
          />
        </FormGroup>
        <FormGroup fluid>
          <FormLabel htmlFor="password">New Password</FormLabel>
          <PasswordInput
            checkIfPwned={true}
            value={state.password}
            onChange={value =>
              setState({
                ...state,
                password: value
              })
            }
          />
        </FormGroup>
        <FormGroup fluid>
          <FormLabel htmlFor="password-confirm">Confirm new password</FormLabel>
          <FormInput
            compact
            value={state.confirmPassword}
            type="password"
            name="confirmPassword"
            onChange={e => {
              setState({
                ...state,
                confirmPassword: e.currentTarget.value
              });
            }}
          />
        </FormGroup>

        {state.error ? (
          <FormNotification error>{state.error}</FormNotification>
        ) : null}
        {state.success ? (
          <FormNotification success>{state.success}</FormNotification>
        ) : null}

        <div styleName="password-btn">
          <Button
            basic
            compact
            stretch
            loading={state.loading}
            disabled={
              !state.oldPassword || !state.password || !state.confirmPassword
            }
            type="submit"
            as="button"
          >
            Update
          </Button>
        </div>
      </form>
    </div>
  );
}

function removeTwoFactorAuth(token) {
  fetch('/api/user/me/2fa', {
    method: 'DELETE',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ token })
  });
}
