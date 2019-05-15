import IgnoreIcon from '../../../../components/ignore-icon';
import React from 'react';
import Toggle from '../../../../components/toggle';
import Tooltip from 'rc-tooltip';
import format from 'date-fns/format';
import { toggleFromIgnoreList } from '../../profile/ignore';
import useUser from '../../../../utils/hooks/use-user';

const mailDateFormat = 'Do MMM YYYY HH:mm';

export default ({
  mail: m,
  onUnsubscribe = () => {},
  setUnsubModal = () => {},
  style = {}
}) => {
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
    <div
      style={style}
      className={`mail-list-item ${m.isLoading ? 'loading' : ''}`}
    >
      <div className="mail-item">
        <div className="avatar" />
        <div className="from">
          <div className="from-name-container">
            <span className="from-name">
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
                <span className="occurrences">x{m.occurrences}</span>
              </Tooltip>
            ) : null}
          </div>
          <span className="from-email">{fromEmail}</span>
          <span className="from-date">
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
              <span className="trash">trash</span>
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
              <span className="trash">spam</span>
            </Tooltip>
          ) : null}
        </div>
        <div className="subject">{m.subject}</div>
        <div className="actions">
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
              className="failed-to-unsub-icon"
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
            <a className="status" onClick={() => setUnsubModal(m)}>
              See details
            </a>
          ) : (
            <span className="status subscribed">Subscribed</span>
          )}
        </div>
      </div>
    </div>
  );
};

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
