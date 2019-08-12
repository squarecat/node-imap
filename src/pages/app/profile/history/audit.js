import './audit.module.scss';

import React, { useMemo } from 'react';
import ErrorBoundary from '../../../../components/error-boundary';
import ProfileLayout from '../../../../app/profile/layout';
import { TextImportant } from '../../../../components/text';
import _sortBy from 'lodash.sortby';
import { parseActivity } from '../../../../utils/activities';
import relative from 'tiny-relative-date';
import request from '../../../../utils/request';
import useAsync from 'react-use/lib/useAsync';

function AuditLogs() {
  // const { value, loading } = useAsync(fetchAuditLogs);
  const loading = false;
  const value = fetchAuditLogs();
  console.log('value', value);

  const content = useMemo(
    () => {
      const logs = loading ? [] : value.logs;
      // const parsed = parseAudits(audits);
      // console.log(`parsed`, parsed);

      let text;
      if (loading) {
        text = <span>Loading...</span>;
      } else if (!logs.length) {
        text = <p>No audit logs yet.</p>;
      } else {
        text = (
          <p>
            Showing{' '}
            <TextImportant>
              {`${logs.length} ${
                logs.length === 1 ? 'audit log' : 'audit logs'
              }`}
            </TextImportant>
            .
          </p>
        );
      }

      return (
        <>
          <div styleName="content">{text}</div>
          <ErrorBoundary>
            {logs.map(log => (
              <div key={`log-${log.groupId}`} styleName="log-group">
                <h3 styleName="log-group-title">{log.group}</h3>
                <div styleName="accordion">
                  {log.messages.map(message => (
                    <div
                      key={`message-${message.timestamp}`}
                      styleName={`message message-${message.level}`}
                    >
                      <p>Level: {message.level}</p>
                      <p>{message.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </ErrorBoundary>
        </>
      );
    },
    [loading, value]
  );

  return <div styleName="section">{content}</div>;
}

function fetchAuditLogs() {
  return {
    userId: 12314,
    logs: [
      {
        startedAt: 3333,
        group: 'user/add-imap-account',
        groupId: '1233',
        messages: [
          {
            timestamp: 1,
            level: 'log',
            message: 'Testing IMAP connection'
          },
          {
            timestamp: 2,
            level: 'log',
            message: 'Successfully added IMAP account'
          }
        ]
      },
      {
        startedAt: 4444,
        group: 'user/imap-fetcher',
        groupId: '55234',
        messages: [
          {
            timestamp: 5,
            level: 'log',
            message: 'Starting IMAP search'
          },
          {
            timestamp: 6,
            level: 'info',
            message: 'Searching IMAP for 6 months'
          },
          {
            timestamp: 7,
            level: 'warn',
            message: 'Parsing warning for IMAP'
          },
          {
            timestamp: 8,
            level: 'error',
            message: 'Failed to search IMAP'
          }
        ]
      }
    ]
  };

  // return request('/api/me/activity', {
  //   credentials: 'same-origin',
  //   headers: {
  //     'Content-Type': 'application/json; charset=utf-8'
  //   }
  // });
}

export default () => {
  return (
    <ProfileLayout pageName="Audit logs">
      <AuditLogs />
    </ProfileLayout>
  );
};

function parseAudits(audits) {
  // const sorted = _sortBy(audits, 'startedAt').reverse();
  // const grouped = logs.reduce((out, log) => {

  // }, [])
  return audits;
}
