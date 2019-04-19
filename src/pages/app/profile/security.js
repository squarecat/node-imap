import './security.module.scss';

import React, { useState } from 'react';
import Table, { TableCell, TableRow } from '../../../components/table';

import Button from '../../../components/btn';
import { FormInput } from '../../../components/form';
import ProfileLayout from './layout';
import SetupTwoFacorAuthModal from '../../../components/modal/create-2fa';
import { TextImportant } from '../../../components/text';
import VerifyTwoFacorAuthModal from '../../../components/modal/verify-2fa';
import useUser from '../../../utils/hooks/use-user';

export default () => {
  const [passwords, setPasswords] = useState({
    password: '',
    passwordConfirm: ''
  });
  const [is2faSetup, show2faSetup] = useState(false);
  const [is2faVerify, show2faVerify] = useState(false);
  const [requiresTwoFactorAuth, { setRequiresTwoFactorAuth }] = useUser(
    u => u.requiresTwoFactorAuth
  );

  const onClickChangePassword = async () => {
    console.warn('not yet implemented');
  };

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
        <FormInput
          value={passwords.oldPassword}
          placeholder="Old password"
          onChange={e => {
            setPasswords({
              ...passwords,
              oldPassword: e.currentTarget.value
            });
          }}
        />
        <FormInput
          value={passwords.newPassword}
          placeholder="New password"
          onChange={e => {
            setPasswords({
              ...passwords,
              newPassword: e.currentTarget.value
            });
          }}
        />
        <FormInput
          value={passwords.newPasswordConfirm}
          placeholder="Confirm new password"
          onChange={e => {
            setPasswords({
              ...passwords,
              newPasswordConfirm: e.currentTarget.value
            });
          }}
        />
        <div styleName="password-btn">
          <Button
            basic
            compact
            disabled={!passwords.newPassword || !passwords.newPasswordConfirm}
            onClick={() => {
              onClickChangePassword();
            }}
          >
            Update
          </Button>
        </div>
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
