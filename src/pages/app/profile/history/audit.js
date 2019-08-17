import './audit.module.scss';

import React, { useCallback, useMemo, useState } from 'react';

import ErrorBoundary from '../../../../components/error-boundary';
import ProfileLayout from '../../../../app/profile/layout';
import { TextImportant } from '../../../../components/text';
import _sortBy from 'lodash.sortby';
import cx from 'classnames';
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
  const { value, loading } = useAsync(fetchAuditLogs);

  const content = useMemo(
    () => {
      const logs = loading ? [] : value;
      const sorted = _sortBy(logs, 'startedAt').reverse();

      let text;
      if (loading) {
        text = <span>Loading...</span>;
      } else if (!logs.length) {
        text = (
          <>
            <p>No audit logs yet.</p>
            <p>
              As you use Leave Me Alone we log the events that we perform such
              as connecting a new account. If you are having problems with your
              account then these logs will help us to understand what is
              happening and fix the problem more quickly.
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
              As you use Leave Me Alone we log the events that we perform such
              as connecting a new account. If you are having problems with your
              account then these logs will help us to understand what is
              happening and fix the problem more quickly.
            </p>
          </>
        );
      }

      return (
        <>
          <div styleName="content">{text}</div>
          <ErrorBoundary>
            {sorted.map((log, logIndex) => (
              <Accordion log={log} key={`log-${logIndex}-${log.groupId}`} />
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
  return request('/api/me/audit', {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

function Accordion({ log }) {
  const [isOpen, setOpen] = useState(false);

  const onClick = useCallback(
    () => {
      setOpen(!isOpen);
    },
    [isOpen]
  );

  const classes = cx('accordion', {
    open: isOpen
  });
  return (
    <div styleName={classes}>
      <div styleName="accordion-header" onClick={onClick}>
        <h3 styleName="log-group">{log.group}</h3>
        <div styleName="log-actions">
          <div styleName="log-date">
            <span styleName="date-relative">{relative(log.startedAt)}</span>
            <span styleName="date-absolute date-muted">
              {formatDate(log.startedAt, logDateFormat)}
            </span>
          </div>
          <span styleName="expand-icon">{isOpen ? '-' : '+'}</span>
        </div>
      </div>
      <div styleName="accordion-content">
        {log.messages.map((message, msgIndex) => (
          <div
            key={`message-${msgIndex}-${message.timestamp}`}
            styleName={`message message-${message.level}`}
          >
            <span styleName="message-date date-muted">
              {formatDate(message.timestamp, logTimeFormat)}
            </span>
            {message.message.includes('\n') ? (
              <pre styleName="message-text">{message.message}</pre>
            ) : (
              <span styleName="message-text">{message.message}</span>
            )}

            <span styleName="message-level">{levels[message.level]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default () => {
  return (
    <ProfileLayout pageName="Audit Logs">
      <AuditLogs />
    </ProfileLayout>
  );
};
