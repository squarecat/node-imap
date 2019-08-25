import './reminder-modal.module.scss';

import { FormGroup, FormLabel, FormSelect } from '../../../components/form';
import { ModalBody, ModalCloseIcon, ModalHeader } from '..';
import React, { useContext, useEffect, useState } from 'react';

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
  const { close: closeModal } = useContext(ModalContext);
  const db = useContext(DatabaseContext);

  const [state, setState] = useState({
    loading: false,
    error: false,
    timeframe: '1m'
  });

  const [mailCount, setMailCount] = useState('-');
  useEffect(
    () => {
      db.mail.count().then(c => {
        setMailCount(c);
      });
    },
    [db]
  );

  const [currentReminder, { setReminder: setUserReminder }] = useUser(
    u => u.reminder
  );
  const hasReminder = currentReminder && !currentReminder.sent;
  let content = null;

  const onSetReminder = async op => {
    try {
      setState({
        ...state,
        loading: true,
        error: false
      });
      const { reminder } = await toggleReminder(op, state.timeframe);
      setUserReminder(reminder);
      setState({
        ...state,
        loading: false,
        error: false
      });
    } catch (err) {
      setState({
        ...state,
        loading: false,
        error:
          'Something went wrong setting your reminder, please try again or send us a message.'
      });
    }
  };

  if (hasReminder) {
    content = (
      <div style={{ textAlign: 'center' }}>
        <p>
          Awesome! You currently have a reminder to unsubscribe again set for:
        </p>
        <TextImportant>
          {format(currentReminder.remindAt, reminderDateFormat)}
        </TextImportant>
        <div styleName="reminder-cta">
          <Button
            basic
            compact
            muted
            outlined
            loading={state.loading}
            disabled={state.loading}
            onClick={() => onSetReminder('remove')}
          >
            Clear reminder
          </Button>

          <Button basic compact outlined onClick={() => closeModal()}>
            Okay
          </Button>
        </div>
      </div>
    );
  } else {
    content = (
      <>
        {mailCount ? (
          <p>
            You could receive{' '}
            <TextImportant>{mailCount} more subscription emails</TextImportant>{' '}
            in the next 6 months.
          </p>
        ) : null}
        <p>
          We can send you an email reminder to unsubscribe again and keep your
          inbox clear.
        </p>
        <FormGroup>
          <FormLabel htmlFor="reminder">Remind me in:</FormLabel>
          <FormSelect
            name="reminder"
            smaller
            disabled={state.loading}
            required
            // basic
            value={state.timeframe}
            options={options}
            onChange={e => {
              setState({ ...state, timeframe: e.currentTarget.value });
            }}
          />
        </FormGroup>
        <div styleName="reminder-cta">
          <Button
            basic
            compact
            loading={state.loading}
            disabled={state.loading}
            onClick={() => onSetReminder('add')}
          >
            <ClockIcon />
            Remind me in {options.find(o => o.value === state.timeframe).label}
          </Button>
        </div>
      </>
    );
  }

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

async function toggleReminder(op, timeframe = '') {
  try {
    return request('/api/me/reminder', {
      method: 'PATCH',
      body: JSON.stringify({ op, value: timeframe })
    });
  } catch (err) {
    console.log('toggle reminder err');
    throw err;
  }
}
