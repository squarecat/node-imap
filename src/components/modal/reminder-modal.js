import './modal.module.scss';

import * as track from '../../utils/analytics';

import React, { useEffect, useState } from 'react';

import Button from '../btn';
import { ClockIcon } from '../icons';
import ModalClose from './modal-close';
import { TextImportant } from '../text';
import format from 'date-fns/format';
import { PRICES as modalPrices } from './price-modal';
import useLocalStorage from '../../utils/hooks/use-localstorage';
import useUser from '../../utils/hooks/use-user';

const reminderDateFormat = 'Do MMMM YYYY';

export default ({ onClose, onSetReminder, onClearReminder }) => {
  const [{ userId, currentReminder, lastPaidScan }] = useUser(u => ({
    userId: u.id,
    currentReminder: u.reminder,
    lastPaidScan: u.lastPaidScan
  }));

  const [isShown, setShown] = useState(false);
  const [localMail] = useLocalStorage(`leavemealone.mail.${userId}`);

  const mailCount = localMail.length;

  const handleKeydown = e => {
    if (e.keyCode === 27 || e.key === 'Escape') {
      onClickClose();
    }
  };

  // on mount
  useEffect(() => {
    setShown(true);
    track.trackReminderModalOpen();
    document.addEventListener('keydown', handleKeydown, false);
    return function cleanup() {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const onClickClose = () => {
    setShown(false);
    setTimeout(onClose, 300);
  };

  const onClickSetReminder = async timeframe => {
    setShown(false);
    setTimeout(() => {
      return onSetReminder(timeframe);
    }, 300);
  };

  const onClickClearReminder = async () => {
    setShown(false);
    setTimeout(() => {
      return onClearReminder();
    }, 300);
  };

  const hasReminder = currentReminder && !currentReminder.sent;
  let nextReminder = null;
  let content = null;

  if (hasReminder) {
    content = (
      <>
        <p>Awesome! You currently have a reminder to scan again set for:</p>
        <p styleName="reminder-date">
          {format(currentReminder.remindAt, reminderDateFormat)}
        </p>
        <div styleName="reminder-cta">
          <Button basic compact muted onClick={() => onClickClearReminder()}>
            Clear reminder
          </Button>
        </div>
      </>
    );
  } else {
    const scanPerformed = modalPrices.find(p => p.value === lastPaidScan);
    nextReminder = {
      label: scanPerformed.label,
      timeframe: scanPerformed.value
    };

    content = (
      <>
        {mailCount ? (
          <>
            <p>
              You could receive{' '}
              <TextImportant>{mailCount} more spam emails</TextImportant> in the
              next {nextReminder.label} (based on your last scan).
            </p>
            <p>
              Don't worry, we can send an email reminding you to scan again! We
              will even give you a <TextImportant>discount code</TextImportant>{' '}
              to say thanks.
            </p>
          </>
        ) : (
          <p>
            We can send you an email reminder to scan again! We will even give
            you a <TextImportant>discount code</TextImportant> to say thanks.
          </p>
        )}
        <div styleName="reminder-cta">
          <Button
            basic
            compact
            onClick={() => onClickSetReminder(nextReminder.timeframe)}
          >
            <ClockIcon />
            Set a reminder to scan again in {nextReminder.label}
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div styleName={`modal ${isShown ? 'shown' : ''}`}>
        <ModalClose onClose={onClickClose} />
        <h3>
          {hasReminder
            ? 'Reminder active'
            : `Remind me in ${nextReminder.label}`}
        </h3>
        <div styleName="modal-content">{content}</div>
      </div>
      <div styleName={`modal-bg ${isShown ? 'shown' : ''}`} />
    </>
  );
};
