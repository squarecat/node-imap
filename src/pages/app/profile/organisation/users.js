import './organisation.module.scss';

import Table, { TableCell, TableRow } from '../../../../components/table';

import React from 'react';
import relative from 'tiny-relative-date';
import request from '../../../../utils/request';
import useAsync from '../../../../utils/hooks/use-async';

function CurrentUsers({ organisationId }) {
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
          {stats.map(stat => (
            <TableRow key={stat.id}>
              <TableCell>{stat.email}</TableCell>
              <TableCell>{stat.numberOfUnsubscribes} unsubscribes</TableCell>
              <TableCell>{stat.timeSaved} time saved</TableCell>
              <TableCell>Joined {relative(stat.dateJoined)}</TableCell>
            </TableRow>
          ))}
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
