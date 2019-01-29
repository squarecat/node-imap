import React, { useState, useEffect } from 'react';
import format from 'date-fns/format';

import useLocalStorage from '../utils/hooks/use-localstorage';
import ModalClose from './modal/modal-close';
import Button from '../components/btn';

import useUser from '../utils/hooks/use-user';
import * as track from '../utils/analytics';

import { PRICES as modalPrices } from './price-modal';

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
    console.log('set reminder for', nextReminder);
    setShown(false);
    setTimeout(() => {
      return onSetReminder(timeframe);
    }, 300);
  };

  const onClickClearReminder = async () => {
    console.log('clear reminder');
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
        <p className="text-important reminder-date">
          {format(currentReminder.remindAt, reminderDateFormat)}
        </p>
        <div className="reminder-cta">
          <Button
            className="clear-reminder-btn"
            basic
            compact
            muted
            onClick={() => onClickClearReminder()}
          >
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
              <span className="text-important">
                {mailCount} more spam emails
              </span>{' '}
              in the next {nextReminder.label} (based on your last scan).
            </p>
            <p>
              Don't worry, we can send an email reminding you to scan again! We
              will even give you a{' '}
              <span className="text-important">discount code</span> to say
              thanks.
            </p>
          </>
        ) : (
          <p>
            We can send you an email reminder to scan again! We will even give
            you a <span className="text-important">discount code</span> to say
            thanks.
          </p>
        )}
        <div className="reminder-cta">
          <Button
            basic
            compact
            onClick={() => onClickSetReminder(nextReminder.timeframe)}
          >
            <span className="reminder-icon">
              <svg
                viewBox="0 0 32 32"
                width="16"
                height="16"
                fill="none"
                stroke="currentcolor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <circle cx="16" cy="16" r="14" />
                <path d="M16 8 L16 16 20 20" />
              </svg>
            </span>
            Set a reminder to scan again in {nextReminder.label}
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={`modal reminder-modal ${isShown ? 'shown' : ''}`}>
        <ModalClose onClose={onClickClose} />
        <h3>
          {hasReminder
            ? 'Reminder active'
            : `Remind me in ${nextReminder.label}`}
        </h3>
        <div className="modal-content">{content}</div>
      </div>
      <div className={`modal-bg ${isShown ? 'shown' : ''}`} />
    </>
  );
};
