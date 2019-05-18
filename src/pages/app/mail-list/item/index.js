import './item.module.scss';

import { MailItemContext, MailItemProvider } from './provider';
import React, { useContext } from 'react';

import IgnoreIcon from '../../../../components/ignore-icon';
import Toggle from '../../../../components/toggle';
import Tooltip from 'rc-tooltip';
import format from 'date-fns/format';
import { toggleFromIgnoreList } from '../../profile/ignore';
import useUser from '../../../../utils/hooks/use-user';

const mailDateFormat = 'Do MMM YYYY HH:mm';

function MailItem({ onUnsubscribe = () => {}, setUnsubModal = () => {} }) {
  const m = useContext(MailItemContext);
  const [user, { setIgnoredSenderList }] = useUser();
  const ignoredSenderList = user.ignoredSenderList || [];
  const isSubscribed = !!m.subscribed;

  const { fromName, fromEmail } = parseFrom(m.from);

  const pureEmail = fromEmail.substr(1).substr(0, fromEmail.length - 2);
  const isIgnored = ignoredSenderList.includes(pureEmail);
  const clickIgnore = () => {
    const newList = isIgnored
      ? ignoredSenderList.filter(sender => sender !== pureEmail)
      : [...ignoredSenderList, pureEmail];
    toggleFromIgnoreList(pureEmail, isIgnored ? 'remove' : 'add');
    setIgnoredSenderList(newList);
    return false;
  };

  return (
    <div styleName="mail-item">
      <div styleName="mail-content">
        <div styleName="avatar" />
        <div styleName="from">
          <div styleName="from-name-container">
            <span styleName="from-name">
              <Tooltip
                placement="top"
                trigger={['hover']}
                mouseLeaveDelay={0}
                overlayClassName="tooltip"
                destroyTooltipOnHide={true}
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
              {fromName}
            </span>
            {m.occurrences > 1 ? (
              <Tooltip
                placement="top"
                trigger={['hover']}
                mouseLeaveDelay={0}
                overlayClassName="tooltip"
                destroyTooltipOnHide={true}
                overlay={
                  <span>
                    You received {m.occurrences} emails from this sender in the
                    past 6 months
                  </span>
                }
              >
                <span styleName="occurrences">x{m.occurrences}</span>
              </Tooltip>
            ) : null}
          </div>
          <span styleName="from-email">{fromEmail}</span>
          <span styleName="from-date">
            {format(new Date(m.date), mailDateFormat)}
          </span>
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
        </div>
        <div styleName="subject">{m.subject}</div>
        <div styleName="actions">
          {m.estimatedSuccess !== false || m.resolved ? (
            <Toggle
              status={isSubscribed}
              loading={m.isLoading}
              disabled={isIgnored}
              onChange={() => onUnsubscribe(m)}
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
        </div>
      </div>
    </div>
  );
}

function parseFrom(str = '') {
  if (!str) {
    return { fromName: '', fromEmail: '' };
  }
  let fromName;
  let fromEmail;
  if (str.match(/^.*<.*>/)) {
    const [, name, email] = /^(.*)(<.*>)/.exec(str);
    fromName = name;
    fromEmail = email;
  } else if (str.match(/<?.*@/)) {
    const [, name] = /<?(.*)@/.exec(str);
    fromName = name || str;
    fromEmail = str;
  } else {
    fromName = str;
    fromEmail = str;
  }
  return { fromName, fromEmail };
}

export default ({ id, ...props }) => {
  return (
    <MailItemProvider id={id}>
      <MailItem {...props} />
    </MailItemProvider>
  );
};
