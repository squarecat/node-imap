import './ignore.module.scss';

import Table, { TableCell, TableRow } from '../../../components/table';

import Button from '../../../components/btn';
import ErrorBoundary from '../../../components/error-boundary';
import ProfileLayout from './layout';
import React from 'react';
import { TextImportant } from '../../../components/text';
import { toggleFromIgnoreList } from '../../../utils/ignore';
import useUser from '../../../utils/hooks/use-user';

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
        <p styleName="content">
          Showing <TextImportant>{ignoredSenderList.length}</TextImportant>{' '}
          favorite senders. Emails from these addresses will not show up in any
          future scans.
        </p>
        <ErrorBoundary>
          <Table>
            <tbody>
              {ignoredSenderList.map(sender => {
                return (
                  <TableRow key={sender}>
                    <TableCell>{sender}</TableCell>
                    <TableCell>
                      <Button
                        compact
                        basic
                        muted
                        onClick={() => remove(sender)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        </ErrorBoundary>
      </div>
    </ProfileLayout>
  );
};
