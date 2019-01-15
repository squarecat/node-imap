import React, { useState, useEffect } from 'react';
import format from 'date-fns/format';

import useLocalStorage from '../utils/hooks/use-localstorage';
import ModalClose from './modal/modal-close';
import Button from '../components/btn';

import useUser from '../utils/hooks/use-user';
import * as track from '../utils/analytics';

const reminderDateFormat = 'Do MMMM YYYY';

export default ({
  onClose,
  currentReminder,
  nextReminder,
  onSetReminder,
  onClearReminder
}) => {
  const [userId] = useUser(u => u.id);
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
    content = (
      <>
        <p>
          You could receive{' '}
          <span className="text-important">{mailCount} more spam emails</span>{' '}
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
