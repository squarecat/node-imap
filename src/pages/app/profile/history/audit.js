import './audit.module.scss';

import React, { useMemo } from 'react';

import ErrorBoundary from '../../../../components/error-boundary';
import ProfileLayout from '../../../../app/profile/layout';
import { TextImportant } from '../../../../components/text';
import _capitalize from 'lodash.capitalize';
import formatDate from 'date-fns/format';
import relative from 'tiny-relative-date';
import request from '../../../../utils/request';
import useAsync from 'react-use/lib/useAsync';

const logDateFormat = 'DD/MM/YYYY HH:mm';
const logTimeFormat = 'HH:mm:ss';
const levels = {
  log: 'Info',
  debug: 'Info',
  info: 'Info',
  warn: 'Warn',
  error: 'Error'
};

function AuditLogs() {
  // const { value, loading } = useAsync(fetchAuditLogs);
  const loading = false;
  const value = fetchAuditLogs();

  const content = useMemo(
    () => {
      const logs = loading ? [] : value.logs;

      let text;
      if (loading) {
        text = <span>Loading...</span>;
      } else if (!logs.length) {
        text = (
          <>
            <p>No audit logs yet.</p>
            <p>
              If you are having problems with your account then these logs will
              help us to understand what is happening and fix the problem more
              quickly.
            </p>
          </>
        );
      } else {
        text = (
          <>
            <p>
              Showing{' '}
              <TextImportant>
                {`${logs.length} ${
                  logs.length === 1 ? 'audit log' : 'audit logs'
                }`}
              </TextImportant>
              .
            </p>
            <p>
              If you are having problems with your account then these logs will
              help us to understand what is happening and fix the problem more
              quickly.
            </p>
          </>
        );
      }

      return (
        <>
          <div styleName="content">{text}</div>
          <ErrorBoundary>
            {logs.map(log => (
              <div styleName="accordion" key={`log-${log.groupId}`}>
                <div styleName="accordion-header">
                  <h3 styleName="log-group">{log.group}</h3>
                  <div styleName="log-date">
                    <span styleName="date-relative">
                      {relative(log.startedAt)}
                    </span>
                    <span styleName="date-absolute date-muted">
                      {formatDate(log.startedAt, logDateFormat)}
                    </span>
                  </div>
                </div>
                <div styleName="accordion-content">
                  {log.messages.map(message => (
                    <div
                      key={`message-${message.timestamp}`}
                      styleName={`message message-${message.level}`}
                    >
                      <span styleName="message-date date-muted">
                        {formatDate(message.timestamp, logTimeFormat)}
                      </span>
                      <p styleName="message-text">{message.message}</p>
                      <span styleName="message-level">
                        {levels[message.level]}
                      </span>
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
        startedAt: 1565667519877,
        group: 'user/add-imap-account',
        groupId: '1233',
        messages: [
          {
            timestamp: 1565667519878,
            level: 'log',
            message: 'Testing IMAP connection'
          },
          {
            timestamp: 1565667519811,
            level: 'log',
            message: 'Successfully added IMAP account'
          }
        ]
      },
      {
        startedAt: 1565667519879,
        group: 'user/imap-fetcher',
        groupId: '55234',
        messages: [
          {
            timestamp: 1565667519880,
            level: 'log',
            message: 'Starting IMAP search'
          },
          {
            timestamp: 1565667519881,
            level: 'info',
            message: 'Searching IMAP for 6 months'
          },
          {
            timestamp: 1565667519882,
            level: 'warn',
            message: 'Parsing warning for IMAP'
          },
          {
            timestamp: 1565667519883,
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
