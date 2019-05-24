import './scans.module.scss';

import Table, { TableCell, TableRow } from '../../../components/table';

import ErrorBoundary from '../../../components/error-boundary';
import ProfileLayout from '../layout';
import React from 'react';
import { TextImportant } from '../../../components/text';
import _sortBy from 'lodash.sortby';
import { parseActivity } from '../../../utils/activities';
import relative from 'tiny-relative-date';
import request from '../../../utils/request';
import { useAsync } from '../../../utils/hooks';

export default function Notifications() {
  const { value, loading } = useAsync(fetchNotifications);
  const activity = loading ? [] : value;

  const notifications = _sortBy(activity, 'timestamp').reverse();

  return (
    <ProfileLayout pageName="Notifications">
      {loading ? (
        <span>Loading...</span>
      ) : (
        <div styleName="scan-section">
          <p>
            Showing <TextImportant>{activity.length}</TextImportant> previous
            notifications.
          </p>
          <ErrorBoundary>
            <Table>
              {notifications.map(activity => {
                return (
                  <TableRow key={activity.timestamp}>
                    <TableCell>{relative(activity.timestamp)}</TableCell>
                    <TableCell>{parseActivity(activity)}</TableCell>
                  </TableRow>
                );
              })}
            </Table>
          </ErrorBoundary>
        </div>
      )}
    </ProfileLayout>
  );
}

function fetchNotifications() {
  return request('/api/me/notifications', {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}
