import './imap.module.scss';

import {
  FormCheckbox,
  FormGroup,
  FormInput,
  FormLabel,
  FormNotification
} from '../form';
import React, { useCallback, useMemo, useReducer } from 'react';
import { TextImportant, TextLink } from '../text';

import PasswordInput from '../form/password';
import { getConnectError } from '../../utils/errors';
import imapReducer from './reducer';
import { openChat } from '../../utils/chat';
import request from '../../utils/request';
import useUser from '../../utils/hooks/use-user';

export const CONFIG = {
  fastmail: {
    label: 'Fastmail',
    imap: {
      host: 'imap.fastmail.com',
      port: 993
    },
    passwordLink: 'https://www.fastmail.com/help/clients/apppassword.html'
  },
  icloud: {
    label: 'iCloud',
    imap: {
      host: 'imap.mail.me.com',
      port: 993
    },
    passwordLink: 'https://support.apple.com/en-us/HT204397'
  },
  yahoo: {
    label: 'Yahoo',
    imap: {
      host: 'imap.mail.yahoo.com',
      port: 993
    },
    passwordLink: 'https://help.yahoo.com/kb/SLN15241.html'
  },
  aol: {
    label: 'AOL',
    imap: {
      host: 'imap.aol.com',
      port: 993
    },
    passwordLink: 'https://help.aol.com/articles/Create-and-manage-app-password'
  }
};

export default ({ actions, onConfirm, providerType }) => {
  const [isImapEnabled] = useUser(u => u.loginProvider === 'password');

  const initialState = providerType
    ? CONFIG[providerType].imap
    : {
        host: '',
        port: 993
      };

  const [state, dispatch] = useReducer(imapReducer, {
    imap: {
      username: '',
      password: '',
      tls: true,
      ssl: true,
      ...initialState
    },
    loading: false
  });

  const onSubmit = useCallback(
    async () => {
      try {
        dispatch({ type: 'set-loading', data: true });
        dispatch({ type: 'set-error', data: false });
        // if (state.imap.host.startsWith('http')) {
        // return dispatch({
        //   type: 'set-error',
        //   data: 'HTTP(S) protocol is not required'
        // });
        // }
        await saveImapConnection(state.imap);
        onConfirm();
      } catch (err) {
        const { message } = getConnectError(err);
        dispatch({ type: 'set-error', data: message });
      } finally {
        dispatch({ type: 'set-loading', data: false });
      }
    },
    [onConfirm, state.imap]
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

  const lead = useMemo(
    () => {
      if (providerType) {
        return getProviderLead(providerType);
      }
      return (
        <p>
          The Internet Message Access Protocol (IMAP) is a mail protocol used
          for accessing email on a remote web server from a local client. This
          should be supported by all modern email clients and web servers, but{' '}
          <TextImportant>may need to be enabled first</TextImportant> from
          within your mail client.
        </p>
      );
    },
    [providerType]
  );

  const content = useMemo(
    () => {
      if (!isImapEnabled) {
        return (
          <>
            <p>
              Connecting other mailboxes is{' '}
              <TextImportant>
                only available for accounts created with password
              </TextImportant>
              .
            </p>
            <p>
              This is because we want to keep your IMAP credentials as secure as
              possible. The best way to do this is by encrypting your
              information using the password you log in with.
            </p>
            <p>
              Please <TextLink onClick={() => openChat()}>contact us</TextLink>{' '}
              and we will switch your account to using email and password.
            </p>
          </>
        );
      }

      const { imap } = state;

      return (
        <>
          {lead}
          <FormGroup unpadded>
            <FormLabel htmlFor="imap-username">
              {providerType
                ? `${CONFIG[providerType].label} email address:`
                : 'Username:'}
            </FormLabel>
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
            {providerType ? null : <p>Usually your email address.</p>}
          </FormGroup>
          <FormGroup unpadded>
            <FormLabel htmlFor="imap-password">
              {providerType
                ? `${CONFIG[providerType].label} password:`
                : 'Password:'}
            </FormLabel>
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
            {providerType ? null : (
              <p>Usually the password you use to sign into the mail client.</p>
            )}
          </FormGroup>
          {providerType ? null : (
            <>
              <FormGroup unpadded>
                <FormLabel htmlFor="imap-host">Host:</FormLabel>
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
                <FormLabel htmlFor="imap-port">Port:</FormLabel>
                <FormInput
                  name="imap-port"
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
            </>
          )}
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
          <FormGroup unpadded>
            <FormCheckbox
              name="imap-ssl"
              disabled={state.loading}
              label="Use SSL"
              checked={imap.ssl}
              onChange={e => {
                const ssl = e.currentTarget.checked;
                if (ssl !== imap.ssl) {
                  dispatch({
                    type: 'set-imap',
                    data: { ssl }
                  });
                }
              }}
            />
          </FormGroup>
          {notification}
        </>
      );
    },
    [isImapEnabled, lead, notification, providerType, state]
  );
  return (
    <form
      id="imap-form"
      name="imap-form"
      onSubmit={e => {
        e.preventDefault();
        onSubmit();
        return false;
      }}
    >
      {content}
      {actions(state)}
    </form>
  );
};

function isWeirdHost(host) {
  return ['outlook.com', 'outlook.office365.com'].includes(host);
}

function isUnsupportedHost(host) {
  return ['imap.gmail.com'].includes(host);
}

function getProviderLead(type) {
  if (type === 'fastmail') {
    return (
      <FormGroup>
        <FormNotification info>
          You need to get an{' '}
          <TextLink inverted href={CONFIG[type].passwordLink} target="_">
            app password
          </TextLink>{' '}
          for Leave Me Alone to access your account. You cannot use your normal
          password.
        </FormNotification>
      </FormGroup>
    );
  }

  if (type === 'icloud') {
    return (
      <FormGroup>
        <FormNotification info>
          If you are using two-factor authentication for your Apple ID or
          getting "check username and password" error you need to generate an{' '}
          <TextLink inverted href={CONFIG[type].passwordLink} target="_">
            app-specific password
          </TextLink>{' '}
          to be used for Leave Me Alone.
        </FormNotification>
      </FormGroup>
    );
  }

  if (type === 'yahoo') {
    return (
      <FormGroup>
        <FormNotification info>
          If you've activated two-step verification or Account Key for your
          Yahoo account, you'll need to generate and use an{' '}
          <TextLink inverted href={CONFIG[type].passwordLink} target="_">
            app password
          </TextLink>{' '}
          to access Yahoo Mail from Leave Me Alone.
        </FormNotification>
      </FormGroup>
    );
  }

  if (type === 'aol') {
    return (
      <FormGroup>
        <FormNotification info>
          If you've activated two-step verification for your AOL account, you'll
          need to generate and use an{' '}
          <TextLink inverted href={CONFIG[type].passwordLink} target="_">
            app password
          </TextLink>{' '}
          to access AOL Mail from Leave Me Alone.
        </FormNotification>
      </FormGroup>
    );
  }
}

async function saveImapConnection(imapDetails) {
  const { host, ssl, tls } = imapDetails;
  let hostWithProtocol = host;
  if (ssl & !tls) {
    hostWithProtocol = `https://${host}`;
  }
  try {
    return request('/api/me', {
      method: 'PATCH',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        op: 'add-imap-account',
        value: { ...imapDetails, host: hostWithProtocol }
      })
    });
  } catch (err) {
    throw err;
  }
}
