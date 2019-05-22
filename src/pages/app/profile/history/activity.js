import './scans.module.scss';

import Table, { TableCell, TableRow } from '../../../../components/table';

import ErrorBoundary from '../../../../components/error-boundary';
import ProfileLayout from '../layout';
import React from 'react';
import { TextImportant } from '../../../../components/text';
import _sortBy from 'lodash.sortby';
import { parseActivity } from '../../../../utils/activities';
import relative from 'tiny-relative-date';
import useUser from '../../../../utils/hooks/use-user';

export default function ActivityHistory() {
  const [{ activity = [], accounts }] = useUser(u => {
    return {
      activity: u.activity,
      accounts: u.accounts
    };
  });

  const sorted = _sortBy(activity, 'timestamp').reverse();
  return (
    <ProfileLayout pageName="Activity History">
      <div styleName="scan-section">
        <p>
          Showing <TextImportant>{activity.length}</TextImportant> previous
          actions.
        </p>
        <ErrorBoundary>
          <Table>
            {sorted.map(activity => {
              return (
                <TableRow key={activity.timestamp}>
                  <TableCell>{relative(activity.timestamp)}</TableCell>
                  <TableCell>{parseActivity(activity, { accounts })}</TableCell>
                </TableRow>
              );
            })}
          </Table>
        </ErrorBoundary>
      </div>
      {sorted.map(activity => (
        <pre key={activity.timestamp}>{JSON.stringify(activity, null, 2)}</pre>
      ))}
    </ProfileLayout>
  );
}
