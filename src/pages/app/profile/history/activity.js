import './scans.module.scss';

import Table, { TableCell, TableRow } from '../../../../components/table';

import ErrorBoundary from '../../../../components/error-boundary';
import ProfileLayout from '../layout';
import React from 'react';
import { TextImportant } from '../../../../components/text';
import _sortBy from 'lodash.sortby';
import { parseActivity } from '../../../../utils/activities';
import relative from 'tiny-relative-date';
import request from '../../../../utils/request';
import { useAsync } from '../../../../utils/hooks';
import useUser from '../../../../utils/hooks/use-user';

function ActivityHistory() {
  const { value, loading } = useAsync(fetchActivity);
  const activity = loading ? [] : value;

  const [{ accounts }] = useUser(u => {
    return {
      accounts: u.accounts
    };
  });

  const sorted = _sortBy(activity, 'timestamp').reverse();
  if (loading) {
    return <span>Loading...</span>;
  }
  return (
    <>
      <div styleName="scan-section">
        <p>
          Showing <TextImportant>{activity.length}</TextImportant> previous
          actions.
        </p>
        <ErrorBoundary>
          <Table>
            <tbody>
              {sorted.map(activity => {
                const parsedActivity = parseActivity(activity, { accounts });
                return (
                  <TableRow key={activity.timestamp}>
                    <TableCell>{relative(activity.timestamp)}</TableCell>
                    <TableCell>{parsedActivity}</TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        </ErrorBoundary>
      </div>
      {sorted.map(activity => (
        <pre key={activity.timestamp}>{JSON.stringify(activity, null, 2)}</pre>
      ))}
    </>
  );
}

function fetchActivity() {
  return request('/api/me/activity', {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

export default () => {
  return (
    <ProfileLayout pageName="Activity History">
      <ActivityHistory />
    </ProfileLayout>
  );
};
