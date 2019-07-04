import './org.module.scss';

import React, { useCallback, useContext, useMemo } from 'react';
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
import useUser from '../../../utils/hooks/use-user';

function CurrentUsers({ organisationId, adminUserEmail, organisationAdmin }) {
  const alert = useContext(AlertContext);
  const { open: openModal } = useContext(ModalContext);
  const [, { setOrganisationLastUpdated }] = useUser();

  const { value: stats = [], loading } = useAsync(
    () => fetchStats(organisationId),
    [organisationId]
  );

  const onRemoveUser = useCallback(
    async ({ email, numberOfAccounts }) => {
      try {
        await removeUser(organisationId, email);
        setOrganisationLastUpdated(Date.now());
        alert.actions.setAlert({
          level: 'success',
          message: `Successfully removed user ${email} & ${numberOfAccounts} connected account${
            numberOfAccounts === 1 ? '' : 's'
          }`,
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
    [alert.actions, organisationId, setOrganisationLastUpdated]
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
      const users = stats.length;
      const totalNumberAccounts = stats.reduce((out, s) => {
        return out + s.numberOfAccounts;
      }, 0);

      let text;
      if (loading) {
        text = <span>Loading...</span>;
      } else if (!users.lenth) {
        text = (
          <p>When members join your organisation they will show up here.</p>
        );
      } else {
        text = (
          <p>
            Showing{' '}
            <TextImportant>
              {`${users} user${users === 1 ? '' : 's'}`}{' '}
            </TextImportant>{' '}
            using{' '}
            <TextImportant>
              {`${totalNumberAccounts} seat${
                totalNumberAccounts === 1 ? '' : 's'
              }`}
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
              <TableHeadCell>Email</TableHeadCell>
              <TableHeadCell />
              <TableHeadCell>Unsubscribes</TableHeadCell>
              <TableHeadCell>Joined</TableHeadCell>
            </TableHead>
            <tbody>
              {stats.map(user => (
                <TableRow key={user.email}>
                  <TableCell>
                    <span styleName="email" title={user.email}>
                      {user.email}
                    </span>
                    <span styleName="email-desc">
                      (
                      {`${user.numberOfAccounts} seat${
                        user.numberOfAccounts === 1 ? '' : 's'
                      }`}
                      )
                    </span>
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
    [adminUserEmail, loading, onClickRemoveUser, organisationAdmin, stats]
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
