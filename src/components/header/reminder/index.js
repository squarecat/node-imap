import './reminder.module.scss';

import React, { useContext } from 'react';

import { ClockIcon } from '../../icons';
import { ModalContext } from '../../../providers/modal-provider';
import ReminderModal from '../../modal/reminder';
import useUser from '../../../utils/hooks/use-user';

function Reminder() {
  const { open: openModal } = useContext(ModalContext);
  const [reminder] = useUser(u => u.reminder);

  const hasReminder = reminder && !reminder.sent;

  return (
    <>
      <button styleName="btn" onClick={() => openModal(<ReminderModal />)}>
        <ClockIcon inline />
        {!hasReminder ? (
          <span styleName="btn-text long">Set reminder</span>
        ) : null}
      </button>
    </>
  );
}

export default Reminder;
