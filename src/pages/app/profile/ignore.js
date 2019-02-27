import React from 'react';
import ErrorBoundary from '../../../components/error-boundary';

import Button from '../../../components/btn';
import ProfileLayout from './layout';
import useUser from '../../../utils/hooks/use-user';
import Table, { TableRow, TableCell } from '../../../components/table';
import { TextImportant } from '../../../components/text';

import './ignore.module.scss';

export async function toggleFromIgnoreList(email, op) {
  const resp = await fetch('/api/me/ignore', {
    method: 'PATCH',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ op, value: email })
  });
  return resp.json();
}

export default () => {
  const [user, { setIgnoredSenderList }] = useUser();
  const ignoredSenderList = user.ignoredSenderList || [];

  const remove = email => {
    toggleFromIgnoreList(email, 'remove');
    setIgnoredSenderList(ignoredSenderList.filter(sender => sender !== email));
  };

  return (
    <ProfileLayout pageName="Favorite Senders">
      <div styleName="ignore-section">
        <p>
          Showing <TextImportant>{ignoredSenderList.length}</TextImportant>{' '}
          favorite senders. Emails from these addresses will not show up in any
          future scans.
        </p>
        <ErrorBoundary>
          <Table>
            {ignoredSenderList.map(sender => {
              return (
                <TableRow key={sender} className="ignore-item">
                  <TableCell>{sender}</TableCell>
                  <TableCell>
                    <Button compact basic muted onClick={() => remove(sender)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        </ErrorBoundary>
      </div>
    </ProfileLayout>
  );
};
