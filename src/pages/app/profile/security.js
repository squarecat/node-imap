import './security.module.scss';

import { FormGroup, FormInput, FormLabel } from '../../../components/form';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import Table, { TableCell, TableRow } from '../../../components/table';
import { TextImportant, TextLink } from '../../../components/text';

import { AlertContext } from '../../../providers/alert-provider';
import Button from '../../../components/btn';
import { ModalContext } from '../../../providers/modal-provider';
import PasswordInput from '../../../components/form/password';
import ProfileLayout from './layout';
import SetupTwoFactorAuthModal from '../../../components/modal/2fa/create-2fa';
import VerifyTwoFacorAuthModal from '../../../components/modal/2fa/verify-2fa';
import _capitalize from 'lodash.capitalize';
import { openChat } from '../../../utils/chat';
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
          <h2>Details</h2>
          <p>
            You currently log in with{' '}
            <TextImportant>{_capitalize(loginProvider)}</TextImportant>.
          </p>
          <p>
            Want to switch to email and password? We don't automate this yet but
            you can <TextLink onClick={() => openChat()}>contact us</TextLink>{' '}
            if you'd like to change your account.
          </p>
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
  const { open: openModal } = useContext(ModalContext);

  const { SetupModal, VerifyModal } = useMemo(
    () => ({
      SetupModal: <SetupTwoFactorAuthModal />,
      VerifyModal: (
        <VerifyTwoFacorAuthModal action={token => removeTwoFactorAuth(token)} />
      )
    }),
    []
  );

  const open2faSetup = useCallback(
    () => {
      const onClose = ({ verified }) => {
        if (verified) {
          setRequiresTwoFactorAuth(true);
        }
      };
      openModal(SetupModal, { dismissable: false, onClose });
    },
    [SetupModal, openModal, setRequiresTwoFactorAuth]
  );
  const open2faVerify = useCallback(
    () => {
      const onClose = ({ verified }) => {
        if (verified) {
          setRequiresTwoFactorAuth(false);
        }
      };
      openModal(VerifyModal, { dismissable: false, onClose });
    },
    [VerifyModal, openModal, setRequiresTwoFactorAuth]
  );
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
      <div styleName="two-factor-auth-table">
        <Table>
          <tbody>
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
                    onClick={() => open2faVerify()}
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    smaller
                    compact
                    muted
                    basic
                    onClick={() => open2faSetup()}
                  >
                    Setup
                  </Button>
                )}
              </TableCell>
            </TableRow>
          </tbody>
        </Table>
      </div>
    </div>
  );
}

function ChangePassword() {
  const { actions: alertActions } = useContext(AlertContext);

  async function onSubmit() {
    setState({ ...state, loading: true });

    try {
      await updatePassword(state.oldPassword, state.password);
      setState({
        oldPassword: '',
        password: '',
        confirmPassword: '',
        loading: false
      });
      alertActions.setAlert({
        id: 'change-password-success',
        level: 'success',
        message: `Password changed.`,
        isDismissable: true,
        autoDismiss: true
      });
    } catch (err) {
      alertActions.setAlert({
        id: 'change-password-error',
        level: 'error',
        message: `Something went wrong changing your password. Please try again or send us a message.`,
        isDismissable: true,
        autoDismiss: true
      });
      setState({
        ...state,
        loading: false
      });
    }
  }

  const [state, setState] = useState({
    oldPassword: '',
    password: '',
    confirmPassword: '',
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
        <FormGroup>
          <FormLabel htmlFor="password">Old Password</FormLabel>
          <FormInput
            autoFocus
            autoComplete="current-password"
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
        <FormGroup>
          <FormLabel htmlFor="password">New Password</FormLabel>
          <PasswordInput
            autoComplete="new-password"
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
        <FormGroup>
          <FormLabel htmlFor="password-confirm">Confirm new password</FormLabel>
          <FormInput
            autoComplete="new-password"
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
