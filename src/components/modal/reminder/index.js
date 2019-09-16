import './reminder-modal.module.scss';

import { FormGroup, FormLabel, FormSelect } from '../../../components/form';
import { ModalBody, ModalCloseIcon, ModalHeader } from '..';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { AlertContext } from '../../../providers/alert-provider';
import Button from '../../btn';
import { ClockIcon } from '../../icons';
import { DatabaseContext } from '../../../providers/db-provider';
import { ModalContext } from '../../../providers/modal-provider';
import { TextImportant } from '../../text';
import format from 'date-fns/format';
import request from '../../../utils/request';
import useUser from '../../../utils/hooks/use-user';

const reminderDateFormat = 'Do MMMM YYYY';

const options = [
  {
    label: '1 week',
    value: '1w'
  },
  {
    label: '1 month',
    value: '1m'
  },
  {
    label: '3 months',
    value: '3m'
  },
  {
    label: '6 months',
    value: '6m'
  }
];

export default () => {
  const db = useContext(DatabaseContext);

  const [mailCount, setMailCount] = useState('-');
  useEffect(() => {
    db.mail.count().then(c => {
      setMailCount(c);
    });
  }, [db]);

  const [currentReminder, { setReminder: setUserReminder }] = useUser(
    u => u.reminder
  );
  const hasReminder = currentReminder && !currentReminder.sent;

  const onReminderSet = useCallback(
    async reminder => {
      setUserReminder(reminder);
    },
    [setUserReminder]
  );

  const content = useMemo(() => {
    if (hasReminder) {
      return (
        <div style={{ textAlign: 'center' }}>
          <p>You currently have a reminder to unsubscribe again set for:</p>
          <TextImportant>
            {format(currentReminder.remindAt, reminderDateFormat)}
          </TextImportant>
          <ClearReminder onReminderSet={onReminderSet} />
        </div>
      );
    } else {
      return (
        <>
          {mailCount ? (
            <p>
              You could receive{' '}
              <TextImportant>
                {mailCount} more subscription emails
              </TextImportant>{' '}
              in the next 6 months.
            </p>
          ) : null}
          <p>
            We can send you an email reminder to unsubscribe again and keep your
            inbox clear.
          </p>
          <ReminderForm onReminderSet={onReminderSet} />
        </>
      );
    }
  }, [currentReminder, hasReminder, mailCount, onReminderSet]);

  return (
    <div styleName="reminder-modal">
      <ModalBody compact>
        <ModalHeader>
          {hasReminder ? 'Reminder active' : 'Set reminder'}
          <ModalCloseIcon />
        </ModalHeader>
        <div>{content}</div>
      </ModalBody>
    </div>
  );
};

async function toggleReminder(op, timeframe = '', recurring = false) {
  try {
    return request('/api/me/reminder', {
      method: 'PATCH',
      body: JSON.stringify({ op, value: { timeframe, recurring } })
    });
  } catch (err) {
    console.log('toggle reminder err');
    throw err;
  }
}

const ClearReminder = React.memo(function ClearReminder({ onReminderSet }) {
  const { close: closeModal } = useContext(ModalContext);
  const { actions } = useContext(AlertContext);
  const [isLoading, setLoading] = useState(false);
  const clear = useCallback(async () => {
    try {
      setLoading(true);
      const { reminder } = await toggleReminder('remove');
      onReminderSet(reminder);
    } catch (err) {
      actions.setAlert({
        message:
          'Something went wrong setting your reminder, please try again or send us a message.',
        isDismissable: true,
        autoDismiss: false,
        level: 'error'
      });
    }
  }, [actions, onReminderSet]);
  return (
    <div styleName="reminder-cta">
      <Button
        basic
        compact
        muted
        outlined
        loading={isLoading}
        disabled={isLoading}
        onClick={clear}
      >
        Clear reminder
      </Button>

      <Button basic compact outlined onClick={() => closeModal()}>
        Okay
      </Button>
    </div>
  );
});
const ReminderForm = React.memo(function ReminderForm({ onReminderSet }) {
  const { actions } = useContext(AlertContext);
  const [isLoading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('1m');
  const [recurring, setRecurring] = useState(true);
  const setReminder = useCallback(async () => {
    try {
      setLoading(true);
      const { reminder } = await toggleReminder('add', timeframe, recurring);
      onReminderSet(reminder);
    } catch (err) {
      actions.setAlert({
        message:
          'Something went wrong setting your reminder, please try again or send us a message.',
        isDismissable: true,
        autoDismiss: false,
        level: 'error'
      });
    }
  }, [actions, onReminderSet, timeframe, recurring]);
  return (
    <>
      <span>
        <span htmlFor="reminder">Remind me</span>
        <span styleName="input">
          <FormSelect
            pill
            name="recurring"
            smaller
            disabled={isLoading}
            required
            value={recurring ? 'recurring' : 'once'}
            options={[
              { value: 'recurring', label: 'every' },
              { value: 'once', label: 'once' }
            ]}
            onChange={e => setRecurring(e.currentTarget.value === 'recurring')}
          />
        </span>
        {recurring ? null : <span>, after</span>}
        <span styleName="input">
          <FormSelect
            pill
            name="reminder"
            smaller
            disabled={isLoading}
            required
            value={timeframe}
            options={options}
            onChange={e => setTimeframe(e.currentTarget.value)}
          />
        </span>
        {recurring ? <span>from now</span> : null}
      </span>
      <div styleName="reminder-cta">
        <Button
          basic
          compact
          loading={isLoading}
          disabled={isLoading}
          onClick={setReminder}
        >
          <ClockIcon />
          Remind me
        </Button>
      </div>
    </>
  );
});
