import './mail-data.module.scss';

import { ModalBody, ModalCloseIcon, ModalHeader } from '..';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import Table, { TableCell, TableRow } from '../../table';
import { TextImportant, TextLink } from '../../text';

import { AlertContext } from '../../../providers/alert-provider';
import Button from '../../btn';
import Tooltip from '../../tooltip';
import cx from 'classnames';
import format from 'date-fns/format';
import relative from 'tiny-relative-date';
import request from '../../../utils/request';
import useUser from '../../../utils/hooks/use-user';

const mailDateFormat = 'Do MMM';
const mailTimeFormat = 'HH:mm YYYY';

const MailData = ({ item, openUnsubModal }) => {
  const { fromEmail, to, forAccount, provider } = item;
  const [{ unsubscriptions, showAccount, accounts }] = useUser(u => ({
    unsubscriptions: u.unsubscriptions,
    showAccount: u.accounts.length > 1 && u.email !== to,
    accounts: u.accounts
  }));

  let providerName;
  if (provider === 'imap') {
    const { displayName } = accounts.find(a => a.email === forAccount);
    providerName = displayName || 'IMAP';
  } else if (provider === 'google') {
    providerName = 'Google';
  } else if (provider === 'outlook') {
    providerName = 'Microsoft';
  } else {
    providerName = provider;
  }

  return (
    <div styleName="mail-data-modal">
      <ModalBody compact>
        <ModalHeader>
          {fromEmail}
          <ModalCloseIcon />
        </ModalHeader>
        <Content
          item={{ ...item, providerName }}
          unsubscriptions={unsubscriptions}
          showAccount={showAccount}
          openUnsubModal={openUnsubModal}
        />
      </ModalBody>
    </div>
  );
};

const Content = React.memo(function({
  item,
  unsubscriptions,
  showAccount,
  openUnsubModal
}) {
  const {
    to,
    fromEmail,
    forAccount,
    fromName,
    isTrash,
    isSpam,
    providerName,
    status,
    occurrences,
    occurrenceCount,
    lastSeenDate
  } = item;

  const unsub = unsubscriptions.find(u => {
    return u.from.includes(`<${fromEmail}>`) && u.to === to;
  });
  const labelObj = {
    spam: isSpam,
    trash: isTrash
  };
  const labels = useMemo(() => {
    if (!isSpam && !isTrash) return null;
    return (
      <ul styleName="labels">
        {Object.keys(labelObj)
          .filter(k => labelObj[k])
          .map(label => (
            <li key={label}>
              <span styleName="label">{label}</span>
            </li>
          ))}
      </ul>
    );
  }, [isSpam, isTrash, labelObj]);

  return (
    <div styleName="mail-data-content">
      <Table>
        <tbody>
          <TableRow>
            <TableCell>To</TableCell>
            <TableCell>
              <span styleName="data-pill">{to}</span>
            </TableCell>
          </TableRow>
          {showAccount ? (
            <TableRow>
              <TableCell>Account</TableCell>
              <TableCell>
                <span styleName="data-pill">{`${forAccount} (${providerName})`}</span>
              </TableCell>
            </TableRow>
          ) : null}
          <TableRow>
            <TableCell>From</TableCell>
            <TableCell>
              <span styleName="data-pill">{`${fromName} <${fromEmail}>`}</span>
            </TableCell>
          </TableRow>
          {labels ? (
            <TableRow>
              <TableCell>Labels</TableCell>
              <TableCell>{labels}</TableCell>
            </TableRow>
          ) : null}
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell>
              <UnsubStatus unsub={unsub} status={status} />
              <UnsubscribedAt status={status} unsub={unsub} />
              <UnsubscribeStatusText
                openUnsubModal={openUnsubModal}
                status={status}
                unsub={unsub}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Occurrences</TableCell>
            <TableCell>
              <Occurrences occurrenceCount={occurrenceCount} />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>History</TableCell>
            <TableCell>
              <History
                lastSeenDate={lastSeenDate}
                occurrences={occurrences}
                occurrenceCount={occurrenceCount}
                unsub={unsub}
              />
            </TableCell>
          </TableRow>
        </tbody>
      </Table>
    </div>
  );
});

const UnsubscribedAt = React.memo(function UnsubscribedAt({ status, unsub }) {
  if (!unsub || status !== 'unsubscribed') {
    return null;
  }
  const { unsubscribedAt } = unsub;
  return (
    <Tooltip
      placement="bottom"
      overlay={
        <>
          <span styleName="from-date">
            {format(unsubscribedAt, mailDateFormat)}
          </span>
          <span styleName="from-time">
            {format(unsubscribedAt, mailTimeFormat)}
          </span>
        </>
      }
    >
      <span styleName="relative-timestamp">{relative(unsubscribedAt)}</span>
    </Tooltip>
  );
});

const UnsubscribeStatusText = React.memo(function UnsubscribeStatusText({
  openUnsubModal,
  unsub
}) {
  if (!unsub) return null;
  const { estimatedSuccess, unsubscribeStrategy } = unsub;
  const text =
    unsubscribeStrategy === 'link'
      ? 'via the unsubscribe link in the email headers'
      : 'by sending an unsubscribe email';

  const estimatedStatus = estimatedSuccess ? 'successful' : 'unsuccessful';
  if (estimatedStatus === 'successful') {
    return (
      <>
        <span styleName="unsub-status-text">
          We unsubscribed <TextImportant>{text}</TextImportant> and estimated
          that the unsubscribe was <TextImportant>successful</TextImportant>.{' '}
          You can{' '}
          <TextLink onClick={openUnsubModal}>see the details here</TextLink>.
        </span>
      </>
    );
  }
  return (
    <>
      <span styleName="unsub-status-text">
        We tried to unsubscribe <TextImportant>{text}</TextImportant> but
        estimated that the unsubscribe <TextImportant>failed</TextImportant>.{' '}
        {unsub.resolved ? (
          <span>You then unsubscribed manually and marked it as resolved.</span>
        ) : null}{' '}
        You can{' '}
        <TextLink onClick={openUnsubModal}>see the details here</TextLink>.
      </span>
    </>
  );
});

const UnsubStatus = React.memo(function UnsubStatus({ status, unsub }) {
  let styles = cx('data-pill');
  let label = status;
  if (unsub) {
    const { resolved } = unsub;
    label = resolved ? 'Resolved manually' : status;
    styles = cx('data-pill', {
      muted: status === 'unsubscribed' || resolved,
      errored: status === 'failed' && !resolved
    });
  }
  return <span styleName={styles}>{label}</span>;
});

const Occurrences = React.memo(function Occurrences({ occurrenceCount }) {
  return (
    <>
      <span styleName="data-pill">x{occurrenceCount}</span>
      <span styleName="occurrences">
        You have received mail from this sender{' '}
        <TextImportant>
          {occurrenceCount > 1
            ? `${occurrenceCount} times in the last 6 months`
            : `once in the last 6 months`}
        </TextImportant>
        .
      </span>
    </>
  );
});

const History = React.memo(function History({
  lastSeenDate,
  occurrences = [],
  occurrenceCount = 1,
  unsub = {}
}) {
  const { actions } = useContext(AlertContext);
  const [, { updateReportedUnsub }] = useUser();
  const [state, setState] = useState({
    loading: false,
    reported: unsub.reported || false,
    reportedAt: unsub.reportedAt || null
  });

  const onReportClick = useCallback(async () => {
    setState({ reportedAt: null, reported: false, loading: true });
    console.log('reporting....', occurrences);
    await reportMail({
      ...unsub,
      lastReceived: lastSeenDate,
      occurrences: occurrenceCount
    });
    const d = Date.now();
    updateReportedUnsub({ ...unsub, reportedAt: d, reported: true });
    setState({ reportedAt: d, reported: true, loading: false });
    actions.setAlert({
      message: <span>{`Report sent`}</span>,
      isDismissable: true,
      autoDismiss: true,
      level: 'info'
    });
  }, [
    occurrences,
    unsub,
    lastSeenDate,
    occurrenceCount,
    updateReportedUnsub,
    actions
  ]);

  const isDelinquent = useMemo(() => {
    if (unsub) {
      const { unsubscribedAt } = unsub;
      const delinquent = lastSeenDate > new Date(unsubscribedAt);
      return delinquent;
    }
    return false;
  }, [lastSeenDate, unsub]);
  debugger;
  return (
    <>
      <table>
        <tbody>
          {occurrences.map(oc => {
            return (
              <tr key={oc.date}>
                <td>
                  <Tooltip
                    placement="bottom"
                    overlay={
                      <>
                        <span styleName="from-date">
                          {format(oc.date, mailDateFormat)}
                        </span>
                        <span styleName="from-time">
                          {format(oc.date, mailTimeFormat)}
                        </span>
                      </>
                    }
                  >
                    <span styleName="timestamp">
                      {relative(new Date(oc.date))}
                    </span>
                  </Tooltip>
                </td>
                <td>
                  <span>{oc.subject}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {isDelinquent ? (
        <>
          <span styleName="report-btn">
            <Button
              loading={state.loading}
              disabled={state.reported || state.loading}
              muted
              outlined
              basic
              smaller
              onClick={onReportClick}
            >
              {state.reported ? 'Reported' : 'Report'}
            </Button>
          </span>
          <ReportData
            reported={state.reported}
            reportedAt={state.reportedAt}
            lastSeen={lastSeenDate}
            unsubscribedAt={unsub.unsubscribedAt}
          />
        </>
      ) : null}
    </>
  );
});

const ReportData = React.memo(function ReportData({
  lastSeen,
  unsubscribedAt,
  reported,
  reportedAt
}) {
  if (reported) {
    return (
      <div styleName="report-text">
        <p>
          You reported this mailing list to us{' '}
          <TextImportant>{relative(reportedAt)}</TextImportant>. We'll email you
          with updates as soon as we have any.
        </p>
      </div>
    );
  }
  if (lastSeen > new Date(unsubscribedAt)) {
    return (
      <div styleName="report-text">
        <p>
          It looks like you unsubscribed from this mailing list but they are
          still sending you mail.
        </p>
        <p>
          We can follow up with them and try and resolve this for you. We'll
          also mark this sender as delinquent and let other users know that they
          do not respond to unsubscribe requests.
        </p>
        <p>
          We'll receive the unencrypted details of this email and your details
          so we can follow up with you later. If this is what you want then hit
          the <TextImportant>report</TextImportant> button above.
        </p>
      </div>
    );
  }
  return null;
});

export default MailData;

function reportMail(item) {
  return request('/api/report', {
    method: 'PUT',
    body: JSON.stringify(item)
  });
}
