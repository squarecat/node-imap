import './imap.module.scss';

import {
  FormCheckbox,
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
      password: '',
      tls: true
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

  const notification = useMemo(
    () => {
      const { imap } = state;
      let content;
      if (state.error) {
        content = <FormNotification error>{state.error}</FormNotification>;
      } else if (isWeirdHost(imap.host)) {
        content = (
          <FormNotification warning>
            We support OAuth for this host which is generally more secure and
            simpler to setup. Consider using this instead of IMAP.
          </FormNotification>
        );
      } else if (isUnsupportedHost(imap.host)) {
        content = (
          <FormNotification error>
            Connecting Google hosts using IMAP is not supported right now due to
            Google's tight security model. Please use our "Connect Google"
            button instead.
          </FormNotification>
        );
      }
      return <FormGroup>{content}</FormGroup>;
    },
    [state]
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
              placeholder="you@example.com"
              disabled={state.loading}
              required
              value={imap.username}
              onChange={e => {
                const username = e.currentTarget.value;
                if (username !== imap.username) {
                  dispatch({
                    type: 'set-imap',
                    data: { username }
                  });
                }
              }}
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
              onChange={value => {
                if (value !== imap.password) {
                  dispatch({
                    type: 'set-imap',
                    data: { password: value }
                  });
                }
              }}
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
              placeholder="imap.example.com"
              value={imap.host}
              onChange={e => {
                const host = e.currentTarget.value;
                if (host !== imap.host) {
                  dispatch({
                    type: 'set-imap',
                    data: { host }
                  });
                }
              }}
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
              onChange={e => {
                const port = e.currentTarget.value;
                if (port !== imap.port) {
                  dispatch({
                    type: 'set-imap',
                    data: { port }
                  });
                }
              }}
            />
            <p>Usually either 993 or 143</p>
          </FormGroup>
          <FormGroup unpadded>
            <FormCheckbox
              name="imap-tls"
              disabled={state.loading}
              label="Use TLS"
              checked={imap.tls}
              onChange={e => {
                const tls = e.currentTarget.checked;
                if (tls !== imap.tls) {
                  dispatch({
                    type: 'set-imap',
                    data: { tls }
                  });
                }
              }}
            />
          </FormGroup>
          {notification}
        </>
      );
    },
    [notification, state]
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
  return ['outlook.com', 'outlook.office365.com'].includes(host);
}

function isUnsupportedHost(host) {
  return ['imap.gmail.com'].includes(host);
}
