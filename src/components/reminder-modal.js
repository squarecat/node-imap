import React, { useState, useEffect } from 'react';
import format from 'date-fns/format';

import ModalClose from './modal/modal-close';
import Button from '../components/btn';

import * as track from '../utils/analytics';
import { getSubsEstimate } from '../utils/estimates';

const reminderDateFormat = 'Do MMMM YYYY';

export default ({
  onClose,
  currentReminder,
  nextReminder,
  mailCount,
  onSetReminder,
  onClearReminder
}) => {
  const [isShown, setShown] = useState(false);

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
    const { moreSubsEstimate } = getSubsEstimate(
      nextReminder.timeframe,
      mailCount
    );

    content = (
      <>
        <p>
          You could receive{' '}
          <span className="text-important">
            {moreSubsEstimate} more spam emails
          </span>{' '}
          in the next {nextReminder.label} (based on your last scan).
        </p>
        <p>
          Don't worry, we can send an email reminding you to scan again! We will
          even give you a <span className="text-important">discount code</span>{' '}
          to say thanks.
        </p>
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
                <path d="M8 17 C8 12 9 6 16 6 23 6 24 12 24 17 24 22 27 25 27 25 L5 25 C5 25 8 22 8 17 Z M20 25 C20 25 20 29 16 29 12 29 12 25 12 25 M16 3 L16 6" />
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
