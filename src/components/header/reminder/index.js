import './reminder.module.scss';

import React, { useContext } from 'react';
import { ModalContext } from '../../../providers/modal-provider';
import useUser from '../../../utils/hooks/use-user';
import ReminderModal from '../../modal/reminder';
import { ClockIcon } from '../../icons';

function Reminder() {
  const { open: openModal } = useContext(ModalContext);
  const [reminder] = useUser(u => u.reminder);

  const hasReminder = reminder && !reminder.sent;

  return (
    <>
      <button styleName="btn" onClick={() => openModal(<ReminderModal />)}>
        <ClockIcon inline={hasReminder} />
        {!hasReminder ? (
          <>
            <span styleName="btn-text short">Remind</span>
            <span styleName="btn-text long">Set reminder</span>
          </>
        ) : null}
      </button>
    </>
  );
}

export default Reminder;
