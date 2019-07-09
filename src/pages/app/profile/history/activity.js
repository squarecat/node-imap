import './history.module.scss';

import React, { useMemo } from 'react';
import Table, { TableCell, TableRow } from '../../../../components/table';

import ErrorBoundary from '../../../../components/error-boundary';
import ProfileLayout from '../../../../app/profile/layout';
import { TextImportant } from '../../../../components/text';
import _sortBy from 'lodash.sortby';
import { parseActivity } from '../../../../utils/activities';
import relative from 'tiny-relative-date';
import request from '../../../../utils/request';
import useAsync from 'react-use/lib/useAsync';
import useUser from '../../../../utils/hooks/use-user';

function ActivityHistory() {
  const { value, loading } = useAsync(fetchActivity);

  const [{ accounts }] = useUser(u => {
    return {
      accounts: u.accounts
    };
  });

  const content = useMemo(
    () => {
      const activity = loading ? [] : value;
      const sorted = _sortBy(activity, 'timestamp').reverse();

      let text;
      if (loading) {
        text = <span>Loading...</span>;
      } else if (!activity.length) {
        text = (
          <p>
            No activity yet. When you perform an action such as connecting an
            additional account it will show up here.
          </p>
        );
      } else {
        text = (
          <p>
            Showing{' '}
            <TextImportant>
              {`${activity.length} ${
                activity.length === 1 ? 'activity' : 'activites'
              }`}
            </TextImportant>
            .
          </p>
        );
      }

      return (
        <>
          <p styleName="content">{text}</p>
          <ErrorBoundary>
            <Table>
              <tbody>
                {sorted.map(activity => {
                  const parsedActivity = parseActivity(activity, { accounts });
                  if (!parsedActivity) return null;
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
        </>
      );
    },
    [accounts, loading, value]
  );

  return <div styleName="section">{content}</div>;
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
