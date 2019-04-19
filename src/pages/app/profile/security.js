import './security.module.scss';

import {
  FormError,
  FormGroup,
  FormInput,
  FormLabel
} from '../../../components/form';
import React, { useState } from 'react';
import Table, { TableCell, TableRow } from '../../../components/table';

import Button from '../../../components/btn';
import PasswordInput from '../../../components/form/password';
import ProfileLayout from './layout';
import SetupTwoFacorAuthModal from '../../../components/modal/create-2fa';
import { TextImportant } from '../../../components/text';
import VerifyTwoFacorAuthModal from '../../../components/modal/verify-2fa';
import useUser from '../../../utils/hooks/use-user';

export async function updatePassword(oldPassword, newPassword) {
  const resp = await fetch('/api/me/password', {
    method: 'PATCH',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      op: 'update',
      value: { password: oldPassword, newPassword }
    })
  });
  return resp.json();
}

export default () => {
  const [state, setState] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    error: false,
    loading: false
  });

  const [is2faSetup, show2faSetup] = useState(false);
  const [is2faVerify, show2faVerify] = useState(false);
  const [requiresTwoFactorAuth, { setRequiresTwoFactorAuth }] = useUser(
    u => u.requiresTwoFactorAuth
  );

  async function onSubmit() {
    setState({ ...state, loading: true });
    const { success, message } = await updatePassword(
      state.oldPassword,
      state.newPassword
    );
    if (success !== true) {
      return setState({
        error: message,
        loading: false
      });
    } else {
      return setState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        error: false,
        loading: false
      });
    }
  }

  return (
    <ProfileLayout pageName="Security">
      <div styleName="security-section two-factor-auth">
        <div styleName="two-factor-auth-content">
          <h2>Two-factor Authentication</h2>
          <p>
            Two-factor authentication adds an additional layer of security to
            your account by requiring more than just a password to log in. We
            support two-facor authentication via the use of an app such as Authy
            or Google Authenticaor
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
      </div>
      <div styleName="security-section">
        <h2>Change password</h2>
        <form
          id="change-password-form"
          // styleName="sign-up-form"
          onSubmit={onSubmit}
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
              value={state.newPassword}
              onChange={value =>
                setState({
                  ...state,
                  newPassword: value
                })
              }
            />
          </FormGroup>
          <FormGroup fluid>
            <FormLabel htmlFor="password-confirm">
              Confirm new password
            </FormLabel>
            <FormInput
              compact
              value={state.confirmNewPassword}
              type="password"
              name="confirmNewPassword"
              onChange={e => {
                setState({
                  ...state,
                  confirmNewPassword: e.currentTarget.value
                });
              }}
            />
          </FormGroup>

          {state.error ? (
            <FormError>
              <p>{state.error}</p>
            </FormError>
          ) : null}

          <div styleName="password-btn">
            <Button
              basic
              compact
              loading={state.loading}
              disabled={!state.oldPassword || !state.newPassword}
              type="submit"
              as="button"
            >
              Update
            </Button>
          </div>
        </form>
      </div>
      {is2faSetup ? (
        <SetupTwoFacorAuthModal
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
    </ProfileLayout>
  );
};

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
