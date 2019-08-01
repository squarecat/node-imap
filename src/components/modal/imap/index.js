import './imap.module.scss';

import {
  FormGroup,
  FormInput,
  FormLabel,
  FormNotification
} from '../../../components/form';
import { ModalBody, ModalCloseIcon, ModalHeader, ModalSaveAction } from '..';
import React, { useCallback, useContext, useMemo, useReducer } from 'react';

import { ModalContext } from '../../../providers/modal-provider';
import PasswordInput from '../../../components/form/password';
import { TextImportant } from '../../text';
import { getImapError } from '../../../utils/errors';
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

export default ({ account = {} } = {}) => {
  const { close: closeModal } = useContext(ModalContext);
  const { username, host, port } = account;

  const [state, dispatch] = useReducer(imapReducer, {
    imap: {
      username: username || '',
      host: host || '',
      port: port || 993,
      password: ''
    },
    loading: false
  });

  const onConfirm = useCallback(
    async () => {
      try {
        dispatch({ type: 'set-loading', data: true });
        dispatch({ type: 'set-error', data: false });

        await saveImapConnection(state.imap);
        closeModal();
      } catch (err) {
        console.error(err);
        const { message } = getImapError(err);
        dispatch({ type: 'set-error', data: message });
      } finally {
        dispatch({ type: 'set-loading', data: false });
      }
    },
    [closeModal, state.imap]
  );

  const content = useMemo(
    () => {
      const { imap } = state;
      return (
        <>
          <p>
            The Internet Message Access Protocol (IMAP) is a mail protocol used
            for accessing email on a remote web server from a local client. This
            should be supported by all modern email clients and web servers, but{' '}
            <TextImportant>may need to be enabled first</TextImportant> from
            within your mail client.
          </p>
          <FormGroup unpadded>
            <FormLabel htmlFor="reminder">Username:</FormLabel>
            <FormInput
              name="imap-username"
              smaller
              disabled={state.loading}
              required
              value={imap.username}
              onChange={e =>
                dispatch({
                  type: 'set-imap',
                  data: { username: e.currentTarget.value }
                })
              }
            />
            <p>Usually your email address.</p>
          </FormGroup>
          <FormGroup unpadded>
            <FormLabel htmlFor="reminder">Password:</FormLabel>
            <PasswordInput
              name="imap-password"
              doValidation={false}
              smaller
              disabled={state.loading}
              required
              value={imap.password}
              autoFocus={false}
              onChange={value =>
                dispatch({
                  type: 'set-imap',
                  data: { password: value }
                })
              }
            />
            <p>Usually the password you use to sign into the mail client.</p>
          </FormGroup>
          <FormGroup unpadded>
            <FormLabel htmlFor="reminder">Host:</FormLabel>
            <FormInput
              name="imap-host"
              smaller
              disabled={state.loading}
              required
              placeholder="imap.gmail.com"
              value={imap.host}
              onChange={e =>
                dispatch({
                  type: 'set-imap',
                  data: { host: e.currentTarget.value }
                })
              }
            />
            <p>Your mail client should tell you what this is.</p>
          </FormGroup>
          <FormGroup unpadded>
            <FormLabel htmlFor="reminder">Port:</FormLabel>
            <FormInput
              name="imap-host"
              smaller
              disabled={state.loading}
              required
              value={imap.port}
              onChange={e =>
                dispatch({
                  type: 'set-imap',
                  data: { port: e.currentTarget.value }
                })
              }
            />
            <p>Usually either 993 or 143</p>
          </FormGroup>
          {state.error ? (
            <FormGroup>
              <FormNotification error>{state.error}</FormNotification>
            </FormGroup>
          ) : null}
          {isWeirdHost(imap.host) ? (
            <FormGroup>
              <FormNotification warning>
                We support OAuth for Gmail and Outlook accounts which is
                generally more secure and simpler to setup. Consider using this
                instead of IMAP.
              </FormNotification>
            </FormGroup>
          ) : null}
        </>
      );
    },
    [state]
  );

  return (
    <div styleName="imap-modal">
      <form
        id="imap-form"
        name="imap-form"
        onSubmit={e => {
          e.preventDefault();
          onConfirm();
          return false;
        }}
      >
        <ModalBody compact>
          <ModalHeader>
            IMAP Setup
            <ModalCloseIcon />
          </ModalHeader>
          <div>{content}</div>
        </ModalBody>
        <ModalSaveAction
          onCancel={closeModal}
          saveText={'Save'}
          isDisabled={state.loading}
          isLoading={state.loading}
        />
      </form>
    </div>
  );
};

async function saveImapConnection(imapDetails) {
  const { host } = imapDetails;
  try {
    if (host.startsWith('http')) {
      throw new Error('HTTP(S) protocol is not required');
    }
    return request('/api/me', {
      method: 'PATCH',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ op: 'add-imap-account', value: imapDetails })
    });
  } catch (err) {
    throw err;
  }
}

function isWeirdHost(host) {
  return ['imap.gmail.com', 'outlook.com', 'office365.com'].includes(host);
}
