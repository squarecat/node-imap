import './organisation.module.scss';

import Table, { TableCell, TableRow } from '../../../../components/table';

import React from 'react';
import cx from 'classnames';
import relative from 'tiny-relative-date';
import request from '../../../../utils/request';
import useAsync from '../../../../utils/hooks/use-async';

function CurrentUsers({ organisationId, adminUserEmail }) {
  const { value: stats = [], loadingStats } = useAsync(fetchStats, [
    organisationId
  ]);

  return (
    <div styleName="organisation-section tabled">
      <div styleName="table-text-content">
        <h2>Current Users</h2>
      </div>
      {loadingStats ? (
        <span>Loading...</span>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Email</th>
              <th />
              <th>Unsubscribes</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(stat => (
              <>
                <TableRow key={stat.email}>
                  <TableCell>
                    {stat.email} ({stat.numberOfAccounts} seats)
                  </TableCell>
                  <TableCell>
                    {stat.email === adminUserEmail ? (
                      <span
                        styleName={cx('org-status', {
                          active: true
                        })}
                      >
                        Admin
                      </span>
                    ) : null}
                  </TableCell>

                  <TableCell>{stat.numberOfUnsubscribes}</TableCell>
                  {/* <TableCell>{stat.timeSaved} time saved</TableCell> */}
                  <TableCell>{relative(stat.joinedAt)}</TableCell>
                </TableRow>
              </>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

function fetchStats(id) {
  return request(`/api/organisation/${id}/stats`, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

export default CurrentUsers;
