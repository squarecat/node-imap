import './item.module.scss';

import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useMailItem } from '../db/hooks';

import UnsubModal from '../../../components/modal/unsub-modal';
import IgnoreIcon from '../../../components/ignore-icon';
import { Info as InfoIcon } from '../../../components/icons';
import { MailContext } from '../provider';
import MailItemDataModal from '../../../components/modal/mail-data';
import { ModalContext } from '../../../providers/modal-provider';
import Score from '../../../components/score';
import Tooltip from '../../../components/tooltip';
import format from 'date-fns/format';

import { useDelinquency } from '../db/hooks';

import { HotKeys } from 'react-hotkeys';
import useIgnore from '../db/use-ignore';
import UnsubToggle from '../../../components/unsub-toggle';

const mailDateFormat = 'Do MMM';
const mailTimeFormat = 'HH:mm YYYY';
const mailDayStamp = 'Do MMM';
const mailYearStamp = 'YYYY';

const keyMap = {
  UNSUBSCRIBE: 'u',
  HEART: 'h'
};

const MailItem = React.memo(function MailItem({ id, onLoad }) {
  const m = useMailItem(id);
  const { actions } = useContext(MailContext);
  const { open: openModal } = useContext(ModalContext);

  const [{ isIgnored }, { setIgnored }] = useIgnore({ fromEmail: m.fromEmail });

  const expand = useCallback(() => {}, []);

  const onSubmit = useCallback(
    ({ success, useImage, failReason = null }) => {
      const { id, from, unsubStrategy } = m;
      actions.resolveUnsubscribe({
        success,
        mailId: id,
        useImage,
        from: from,
        reason: failReason,
        unsubStrategy
      });
    },
    [actions, m]
  );
  const openUnsubModal = useCallback(() => {
    openModal(<UnsubModal onSubmit={onSubmit} mail={m} />);
  }, [m, onSubmit, openModal]);

  const handlers = useMemo(() => {
    return {
      UNSUBSCRIBE: () => actions.unsubscribe(m),
      HEART: setIgnored
    };
  }, [actions, setIgnored, m]);

  useEffect(() => {
    if (m.key) {
      // remove jank
      requestAnimationFrame(() => {
        onLoad();
      });
    }
  }, [m, onLoad]);

  return (
    <>
      <td styleName="cell timestamp-column">
        <span styleName="from-datetime">
          <DateCell date={m.getLatest().date} />
        </span>
      </td>
      <td styleName="cell from-column">
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
              <a onClick={() => setIgnored()}>
                <IgnoreIcon ignored={isIgnored} />
              </a>
            </Tooltip>
            <span title={m.fromName}>{m.fromName}</span>
          </span>

          <Occurrences onClick={expand} mail={m} />
        </div>
        <MailDataLink
          item={m}
          onUnsubscribe={actions.unsubscribe}
          openUnsubModal={openUnsubModal}
        />
      </td>
      <td styleName="cell subject-column">
        <span styleName="subject" title={m.getLatest().subject}>
          {m.getLatest().subject}
        </span>
      </td>
      <td styleName="cell tags-column">
        {m.isTrash ? (
          <Tooltip
            placement="top"
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
            mouseLeaveDelay={0}
            overlayClassName="tooltip"
            destroyTooltipOnHide={true}
            overlay={<span>This email was in your spam folder</span>}
          >
            <span styleName="trash">spam</span>
          </Tooltip>
        ) : null}
      </td>
      <td styleName="cell score-column">
        <ItemScore mail={m} />
      </td>
      <td styleName="cell actions-column" data-focus>
        <HotKeys handlers={handlers} keyMap={keyMap} allowChanges={true}>
          <UnsubToggle
            mail={m}
            isIgnored={isIgnored}
            onUnsubscribe={actions.unsubscribe}
            openUnsubModal={openUnsubModal}
          />
        </HotKeys>
      </td>
    </>
  );
});

function ItemScore({ mail }) {
  const { score, fromEmail: sender } = mail;

  return <Score address={sender} score={score} />;
}

function Occurrences({ mail }) {
  const { occurrenceCount } = mail;

  return (
    <span styleName="occurrences-wrapper" data-occurrences={occurrenceCount}>
      <Tooltip
        overlay={
          <span>
            You received {occurrenceCount} emails from this sender in the past 6
            months
          </span>
        }
      >
        <span styleName="occurrences">x{occurrenceCount}</span>
      </Tooltip>
    </span>
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

const MailDataLink = React.memo(function({
  openUnsubModal,
  item,
  onUnsubscribe
}) {
  const { open: openModal } = useContext(ModalContext);
  const { delinquent, reported } = useDelinquency(item);
  const content = (
    <a
      styleName={`mail-data-link ${delinquent ? 'delinquent' : ''}`}
      onClick={() =>
        openModal(
          <MailItemDataModal
            item={item}
            onUnsubscribe={onUnsubscribe}
            openUnsubModal={openUnsubModal}
          />
        )
      }
    >
      <InfoIcon width="12" height="12" />
      <span styleName="from-email">{`<${item.fromEmail || ''}>`}</span>
    </a>
  );
  if (delinquent && !reported) {
    return (
      <Tooltip
        placement="bottom"
        overlay={
          <span>
            We think this sender is behaving badly. Click for more info.
          </span>
        }
      >
        {content}
      </Tooltip>
    );
  }
  return content;
});

export default React.memo(MailItem);
