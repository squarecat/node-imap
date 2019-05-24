import './ignore.module.scss';

import Table, { TableCell, TableRow } from '../../components/table';

import Button from '../../components/btn';
import ErrorBoundary from '../../components/error-boundary';
import ProfileLayout from './layout';
import React from 'react';
import { TextImportant } from '../../components/text';
import request from '../../utils/request';
import useUser from '../../utils/hooks/use-user';

export async function toggleFromIgnoreList(email, op) {
  return request('/api/me/ignore', {
    method: 'PATCH',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ op, value: email })
  });
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
                <TableRow key={sender}>
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
