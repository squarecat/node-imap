import './item.module.scss';

import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useMailItem, useOccurrence, useScore } from '../db/hooks';

import IgnoreIcon from '../../../components/ignore-icon';
import { MailContext } from '../provider';
import MailItemDataModal from '../../../components/modal/mail-data';
import { ModalContext } from '../../../providers/modal-provider';
import Score from '../../../components/score';
import Toggle from '../../../components/toggle';
import Tooltip from '../../../components/tooltip';
import format from 'date-fns/format';
import { toggleFromIgnoreList } from '../../../utils/ignore';
import useUser from '../../../utils/hooks/use-user';

const mailDateFormat = 'Do MMM';
const mailTimeFormat = 'HH:mm YYYY';
const mailDayStamp = 'Do MMM';
const mailYearStamp = 'YYYY';

function MailItem({ id, onLoad }) {
  const m = useMailItem(id);
  const { open: openModal } = useContext(ModalContext);

  const { actions } = useContext(MailContext);

  const [ignoredSenderList, { setIgnoredSenderList }] = useUser(
    u => u.ignoredSenderList || []
  );

  const isIgnored = useMemo(
    () => {
      return ignoredSenderList.includes(m.fromEmail);
    },
    [ignoredSenderList, m.fromEmail]
  );

  const clickIgnore = useCallback(
    () => {
      const newList = isIgnored
        ? ignoredSenderList.filter(sender => sender !== m.fromEmail)
        : [...ignoredSenderList, m.fromEmail];
      toggleFromIgnoreList(m.fromEmail, isIgnored ? 'remove' : 'add');
      setIgnoredSenderList(newList);
      return false;
    },
    [ignoredSenderList, isIgnored, m.fromEmail, setIgnoredSenderList]
  );

  useEffect(
    () => {
      if (m) {
        onLoad();
      }
    },
    [m, onLoad]
  );

  return (
    <>
      <td styleName="cell timestamp-column">
        <span styleName="from-datetime">
          <DateCell date={m.date} />
        </span>
      </td>
      <td styleName="cell from-column">
        <div styleName="from-name-container">
          <span styleName="from-name" title={m.fromName}>
            <Tooltip
              overlay={
                <span>
                  {isIgnored
                    ? 'This sender is on your favorite list'
                    : 'Click to ignore this sender in future scans'}
                </span>
              }
            >
              <a onClick={() => clickIgnore()}>
                <IgnoreIcon ignored={isIgnored} />
              </a>
            </Tooltip>
            {m.fromName}
          </span>
          {m.fromEmail ? (
            <Occurrences fromEmail={m.fromEmail} toEmail={m.to} />
          ) : null}
        </div>
        <a onClick={() => openModal(<MailItemDataModal item={m} />)}>
          <span styleName="from-email">{`<${m.fromEmail}>`}</span>
        </a>
      </td>
      <td styleName="cell tags-column">
        {m.isTrash ? (
          <Tooltip
            placement="top"
            trigger={['hover']}
            mouseLeaveDelay={0}
            overlayClassName="tooltip"
            destroyTooltipOnHide={true}
            overlay={<span>This email was in your trash folder</span>}
          >
            <span styleName="trash">trash</span>
          </Tooltip>
        ) : null}
        {m.isSpam ? (
          <Tooltip
            placement="top"
            trigger={['hover']}
            mouseLeaveDelay={0}
            overlayClassName="tooltip"
            destroyTooltipOnHide={true}
            overlay={<span>This email was in your spam folder</span>}
          >
            <span styleName="trash">spam</span>
          </Tooltip>
        ) : null}
      </td>
      <td styleName="cell subject-column">
        <span styleName="subject" title={m.subject}>
          {m.subject}
        </span>
      </td>
      <td styleName="cell score-column">
        <ItemScore sender={m.fromEmail} />
      </td>
      <td styleName="cell actions-column">
        <UnsubToggle
          mail={m}
          isIgnored={isIgnored}
          onUnsubscribe={actions.onUnsubscribe}
          setUnsubModal={() => {
            // defensive code against an old bug where unsubStrategy can be null
            let strat = m.unsubStrategy;
            if (!strat) {
              strat = m.unsubscribeLink ? 'link' : 'mailto';
            }
            actions.setUnsubData({ ...m, unsubStrategy: strat });
          }}
        />
      </td>
    </>
  );
}

function ItemScore({ sender }) {
  const { rank, score, unsubscribePercentage } = useScore(sender);

  return (
    <Score
      rank={rank}
      address={sender}
      score={score}
      unsubscribePercentage={unsubscribePercentage}
    />
  );
}

function Occurrences({ fromEmail, toEmail }) {
  const occurrences = useOccurrence({ fromEmail, toEmail });
  if (occurrences < 2) {
    return null;
  }
  return (
    <Tooltip
      overlay={
        <span>
          You received {occurrences} emails from this sender in the past 6
          months
        </span>
      }
    >
      <span styleName="occurrences">x{occurrences}</span>
    </Tooltip>
  );
}

function UnsubToggle({ mail, isIgnored, onUnsubscribe, setUnsubModal }) {
  const isSubscribed = !!mail.subscribed;
  let content;
  const everythingOk = mail.estimatedSuccess !== false || mail.resolved;
  if (everythingOk) {
    content = (
      <Toggle
        status={isSubscribed}
        loading={mail.isLoading}
        disabled={isIgnored}
        onChange={() => onUnsubscribe(mail)}
      />
    );
  } else {
    content = (
      <svg
        onClick={() => setUnsubModal()}
        styleName="failed-to-unsub-icon"
        viewBox="0 0 32 32"
        width="20"
        height="20"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      >
        <path d="M16 14 L16 23 M16 8 L16 10" />
        <circle cx="16" cy="16" r="14" />
      </svg>
    );
  }

  let status;
  if (mail.isLoading) {
    status = null;
  } else if (!isSubscribed) {
    status = (
      <a styleName="status" onClick={() => setUnsubModal(mail)}>
        See details
      </a>
    );
  } else {
    status = <span styleName="status subscribed">Subscribed</span>;
  }

  return (
    <>
      {content}
      {status}
    </>
  );
}

function DateCell({ date } = {}) {
  if (!date) return null;
  const mailDate = new Date(date);
  return (
    <>
      <span styleName="from-date">{format(mailDate, mailDateFormat)}</span>
      <span styleName="from-time">{format(mailDate, mailTimeFormat)}</span>
      <span styleName="from-timestamp">
        <span styleName="from-day">{format(mailDate, mailDayStamp)}</span>
        <span styleName="from-year">{format(mailDate, mailYearStamp)}</span>
      </span>
    </>
  );
}

export default React.memo(MailItem);
