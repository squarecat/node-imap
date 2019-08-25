import './org.module.scss';

import React, { useCallback, useContext, useMemo } from 'react';
import Table, { TableCell, TableRow } from '../../../components/table';

import { AlertContext } from '../../../providers/alert-provider';
import Button from '../../../components/btn';
import { TextImportant } from '../../../components/text';
import request from '../../../utils/request';
import useUser from '../../../utils/hooks/use-user';

function InvitedUsers({ organisationId, invitedUsers }) {
  const alert = useContext(AlertContext);
  const [, { setOrganisationLastUpdated }] = useUser();

  const onRevokeInvite = useCallback(
    async email => {
      try {
        await revokeOrganisationInvite(organisationId, email);
        setOrganisationLastUpdated(Date.now());
        alert.actions.setAlert({
          level: 'success',
          message: `Successfully revoked invite for ${email}!`,
          isDismissable: true,
          autoDismiss: true
        });
      } catch (err) {
        alert.actions.setAlert({
          level: 'error',
          message: `Error revoking invite for ${email}. Please try again or send us a message.`,
          isDismissable: true,
          autoDismiss: true
        });
      }
    },
    [organisationId, setOrganisationLastUpdated, alert.actions]
  );

  const content = useMemo(
    () => {
      let text;
      if (!invitedUsers.length) {
        text = (
          <p>
            When you invite people to your team by email they will show up here
            until they join.
          </p>
        );
      } else {
        text = (
          <p>
            Showing{' '}
            <TextImportant>
              {`${invitedUsers.length} pending invite${
                invitedUsers.length === 1 ? '' : 's'
              }`}
            </TextImportant>
            .
          </p>
        );
      }

      return (
        <>
          <div styleName="table-text-content">
            <h2>Pending Invites</h2>
            {text}
          </div>
          <Table>
            <tbody>
              {invitedUsers.map(email => (
                <TableRow key={email}>
                  <TableCell>{email}</TableCell>
                  <TableCell>
                    <Button
                      basic
                      compact
                      muted
                      smaller
                      onClick={() => onRevokeInvite(email)}
                    >
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </>
      );
    },
    [invitedUsers, onRevokeInvite]
  );

  return <div styleName="organisation-section tabled">{content}</div>;
}

export default InvitedUsers;

function revokeOrganisationInvite(id, email) {
  return request(`/api/organisation/${id}/invite`, {
    method: 'PATCH',
    body: JSON.stringify({ op: 'remove', value: email })
  });
}
