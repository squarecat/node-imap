import './org.module.scss';

import React, { useCallback, useContext, useMemo, useState } from 'react';
import Table, {
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow
} from '../../../components/table';

import { AlertContext } from '../../../providers/alert-provider';
import Button from '../../../components/btn';
import { ModalContext } from '../../../providers/modal-provider';
import { TextImportant } from '../../../components/text';
import WarningModal from '../../../components/modal/warning-modal';
import relative from 'tiny-relative-date';
import request from '../../../utils/request';
import useAsync from 'react-use/lib/useAsync';

function CurrentUsers({ organisationId, adminUserEmail, organisationAdmin }) {
  const alert = useContext(AlertContext);
  const { open: openModal } = useContext(ModalContext);
  const [lastUpdated, setLastUpdated] = useState(null);

  const { value: users = [], loading } = useAsync(
    () => fetchStats(organisationId),
    [lastUpdated]
  );

  const onRemoveUser = useCallback(
    async ({ email, accounts }) => {
      try {
        await removeUser(organisationId, email);
        setLastUpdated(Date.now());
        alert.actions.setAlert({
          level: 'success',
          message: `Successfully removed user ${email} & ${
            accounts.length
          } connected account${accounts.length === 1 ? '' : 's'}`,
          isDismissable: true,
          autoDismiss: true
        });
      } catch (err) {
        alert.actions.setAlert({
          level: 'error',
          message: `Error removing user ${email}. Please try again or send us a message.`,
          isDismissable: true,
          autoDismiss: true
        });
      }
    },
    [alert.actions, organisationId, setLastUpdated]
  );

  const onClickRemoveUser = useCallback(
    user =>
      openModal(
        <WarningModal
          onConfirm={() => onRemoveUser(user)}
          content={
            <p>
              <TextImportant>WARNING:</TextImportant> this will remove this user
              and all of their connected accounts from this organisation. Your
              subscription will be updated to reflect this.
            </p>
          }
          confirmText="Confirm"
        />,
        {
          dismissable: true
        }
      ),
    [openModal, onRemoveUser]
  );

  const content = useMemo(
    () => {
      const seatsUsed = users.reduce((out, u) => {
        return out + u.accounts.length;
      }, 0);

      let text;
      if (loading) {
        text = <span>Loading...</span>;
      } else if (!users.length) {
        text = (
          <p>When members join your organisation they will show up here.</p>
        );
      } else {
        text = (
          <p>
            Showing{' '}
            <TextImportant>
              {`${users.length} user${users.length === 1 ? '' : 's'}`}{' '}
            </TextImportant>{' '}
            with{' '}
            <TextImportant>
              {`${seatsUsed} connected account${
                seatsUsed === 1 ? '' : 's'
              } (seats)`}
            </TextImportant>
            .
          </p>
        );
      }

      return (
        <>
          <div styleName="table-text-content">
            <h2>Current Members</h2>
            {text}
          </div>
          <Table>
            <TableHead>
              <TableHeadCell>User</TableHeadCell>
              <TableHeadCell />
              <TableHeadCell>Unsubscribes</TableHeadCell>
              <TableHeadCell>Joined</TableHeadCell>
            </TableHead>
            <tbody>
              {users.map(user => (
                <TableRow key={user.email}>
                  <TableCell>
                    <span styleName="email" title={user.email}>
                      {user.email}{' '}
                      <span styleName="seats">{`(${user.accounts.length} seat${
                        user.accounts.length === 1 ? '' : 's'
                      })`}</span>
                    </span>
                    <div styleName="accounts">
                      {user.accounts.map(email => (
                        <span key={email} styleName="account">
                          {email}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.email === adminUserEmail ? (
                      <span styleName="admin">Admin</span>
                    ) : null}
                  </TableCell>

                  <TableCell>{user.numberOfUnsubscribes}</TableCell>
                  {/* <TableCell>{user.timeSaved} time saved</TableCell> */}
                  <TableCell>{relative(user.joinedAt)}</TableCell>
                  <TableCell>
                    {organisationAdmin && user.email !== adminUserEmail ? (
                      <Button
                        basic
                        compact
                        muted
                        smaller
                        onClick={() => onClickRemoveUser(user)}
                      >
                        x
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </>
      );
    },
    [adminUserEmail, loading, onClickRemoveUser, organisationAdmin, users]
  );

  return <div styleName="organisation-section tabled users">{content}</div>;
}

function fetchStats(id) {
  return request(`/api/organisation/${id}/stats`, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

function removeUser(id, email) {
  return request(`/api/organisation/${id}`, {
    method: 'PATCH',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ op: 'remove-user', value: email })
  });
}

export default CurrentUsers;
