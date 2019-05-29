import './item.module.scss';

import React, { useContext } from 'react';
import { useMailItem, useOccurrence, useScore } from '../db/hooks';

import IgnoreIcon from '../../../components/ignore-icon';
import { MailContext } from '../provider';
import Score from '../../../components/score';
import Toggle from '../../../components/toggle';
import Tooltip from '../../../components/tooltip';
import format from 'date-fns/format';
import { toggleFromIgnoreList } from '../../profile/ignore';
import useUser from '../../../utils/hooks/use-user';

const mailDateFormat = 'Do MMM';
const mailTimeFormat = 'HH:mm YYYY';

export default function MailItem({ id, setUnsubModal = () => {} }) {
  const m = useMailItem(id);
  const { actions } = useContext(MailContext);

  const [user, { setIgnoredSenderList }] = useUser();
  const ignoredSenderList = user.ignoredSenderList || [];
  const isSubscribed = !!m.subscribed;

  const isIgnored = ignoredSenderList.includes(m.fromEmail);
  const clickIgnore = () => {
    const newList = isIgnored
      ? ignoredSenderList.filter(sender => sender !== m.fromEmail)
      : [...ignoredSenderList, m.fromEmail];
    toggleFromIgnoreList(m.fromEmail, isIgnored ? 'remove' : 'add');
    setIgnoredSenderList(newList);
    return false;
  };

  return (
    <>
      <td styleName="timestamp-column">
        <span styleName="from-datetime">
          <span styleName="from-date">
            {format(new Date(m.date), mailDateFormat)}
          </span>
          <span styleName="from-time">
            {format(new Date(m.date), mailTimeFormat)}
          </span>
        </span>
      </td>
      <td styleName="from-column">
        <div styleName="from-name-container">
          <span styleName="from-name">
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
        <span styleName="from-email">{`<${m.fromEmail}>`}</span>
      </td>
      <td styleName="tags-column">
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
      <td styleName="subject-column">
        <span styleName="subject"> {m.subject}</span>
      </td>
      <td styleName="score-column">
        <ItemScore sender={m.fromEmail} />
      </td>
      <td styleName="actions-column">
        {m.estimatedSuccess !== false || m.resolved ? (
          <Toggle
            status={isSubscribed}
            loading={m.isLoading}
            disabled={isIgnored}
            onChange={() => actions.onUnsubscribe(m)}
          />
        ) : (
          <svg
            onClick={() => setUnsubModal(m, true)}
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
        )}
        {!isSubscribed ? (
          <a styleName="status" onClick={() => setUnsubModal(m)}>
            See details
          </a>
        ) : (
          <span styleName="status subscribed">Subscribed</span>
        )}
      </td>
    </>
  );
}

function ItemScore({ sender }) {
  if (!sender) {
    return null;
  }
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
