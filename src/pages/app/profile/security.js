import './security.module.scss';

import React, { useState } from 'react';
import Table, { TableCell, TableRow } from '../../../components/table';

import Button from '../../../components/btn';
import { FormInput } from '../../../components/form';
import ProfileLayout from './layout';
import { TextImportant } from '../../../components/text';

export default () => {
  const [passwords, setPasswords] = useState({
    password: '',
    passwordConfirm: ''
  });

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
            your account by requiring more than just a password to log in.
          </p>
        </div>
        <Table>
          <TableRow>
            <TableCell>Two-factor Methods</TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
          <TableRow inverted>
            <TableCell>Authenticator app</TableCell>
            <TableCell>
              <TextImportant>Configured</TextImportant>
            </TableCell>
            <TableCell>
              <Button smaller compact muted basic onClick={() => {}}>
                Edit
              </Button>
            </TableCell>
          </TableRow>
        </Table>

        <Table>
          <TableRow>
            <TableCell>Recovery Options</TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
          <TableRow inverted>
            <TableCell>Recovery codes</TableCell>
            <TableCell>
              <TextImportant>Viewed</TextImportant>
            </TableCell>
            <TableCell>
              <Button smaller compact muted basic onClick={() => {}}>
                Show
              </Button>
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
    </ProfileLayout>
  );
};
