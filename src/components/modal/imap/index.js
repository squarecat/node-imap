import './imap.module.scss';

import { FormGroup, FormInput, FormLabel } from '../../../components/form';
import { ModalBody, ModalCloseIcon, ModalHeader, ModalSaveAction } from '..';
import React, { useCallback, useContext, useReducer } from 'react';

import { ModalContext } from '../../../providers/modal-provider';
import request from '../../../utils/request';

const imapReducer = (state, action) => {
  const { type, data } = action;
  if (type === 'reset') {
    return {
      ...state,
      imap: data,
      error: null,
      loading: false
    };
  }
  if (type === 'set-imap') {
    return {
      ...state,
      imap: {
        ...state.imap,
        ...data
      }
    };
  }
  if (type === 'set-loading') {
    return {
      ...state,
      loading: data
    };
  }
  if (type === 'set-error') {
    return {
      ...state,
      error: data
    };
  }
  return state;
};
export default ({ account }) => {
  const { close: closeModal } = useContext(ModalContext);
  const { username, host, port } = account;

  const [state, dispatch] = useReducer(imapReducer, {
    imap: {
      username: username || '',
      host: host || '',
      port: port || 443,
      password: ''
    },
    loading: false
  });

  const onConfirm = useCallback(
    async () => {
      const isValid = await testImapConnection(state.imap);
      if (isValid) {
        await saveImapConnection(state.imap);
      } else {
        dispatch({ type: 'set-error' });
      }
    },
    [state.imap]
  );

  const content = (
    <>
      <p>setup instructions</p>
      <FormGroup>
        <FormLabel htmlFor="reminder">Username:</FormLabel>
        <FormInput
          name="imap-username"
          smaller
          disabled={state.loading}
          required
          value={state.username}
          onChange={e =>
            dispatch({
              type: 'set-imap',
              data: { username: e.currentTarget.value }
            })
          }
        />
      </FormGroup>
      <FormGroup>
        <FormLabel htmlFor="reminder">Password:</FormLabel>
        <FormInput
          name="imap-password"
          smaller
          disabled={state.loading}
          required
          value={state.password}
          onChange={e =>
            dispatch({
              type: 'set-imap',
              data: { password: e.currentTarget.value }
            })
          }
        />
      </FormGroup>
      <FormGroup>
        <FormLabel htmlFor="reminder">Host:</FormLabel>
        <FormInput
          name="imap-host"
          smaller
          disabled={state.loading}
          required
          placeholder="imap.gmail.com"
          value={state.host}
          onChange={e =>
            dispatch({
              type: 'set-imap',
              data: { host: e.currentTarget.value }
            })
          }
        />
      </FormGroup>
      <FormGroup>
        <FormLabel htmlFor="reminder">Port:</FormLabel>
        <FormInput
          name="imap-host"
          smaller
          disabled={state.loading}
          required
          value={state.port}
          onChange={e =>
            dispatch({
              type: 'set-imap',
              data: { port: e.currentTarget.value }
            })
          }
        />
      </FormGroup>
    </>
  );

  return (
    <div styleName="reminder-modal">
      <ModalBody compact>
        <ModalHeader>
          IMAP Setup
          <ModalCloseIcon />
        </ModalHeader>
        <div>{content}</div>
        <ModalSaveAction
          onSave={() => {
            onConfirm();
          }}
          onCancel={closeModal}
          saveText={'Save'}
        />
      </ModalBody>
    </div>
  );
};

async function testImapConnection(imapDetails) {
  try {
    return request('/api/imap/test', {
      method: 'POST',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ imapDetails })
    });
  } catch (err) {
    throw err;
  }
}

async function saveImapConnection(imapDetails) {
  try {
    return request('/api/me/imap', {
      method: 'PATCH',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ op: 'add', data: imapDetails })
    });
  } catch (err) {
    throw err;
  }
}
