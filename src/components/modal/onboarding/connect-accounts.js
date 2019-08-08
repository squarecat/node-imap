import React, { useMemo, useState } from 'react';

import AccountProviderButtons from '../../connect-account/providers';
import ConnectedAccountList from '../../connect-account/list';
import { FormNotification } from '../../form';
import { TextImportant } from '../../text';
import _capitalize from 'lodash.capitalize';
import { fetchLoggedInUser } from '../../../utils/auth';
import { getConnectError } from '../../../utils/errors';
import request from '../../../utils/request';
import useUser from '../../../utils/hooks/use-user';

export default ({ onboarding = false, enterprise = false }) => {
  const [{ accounts, email, loginProvider }, { load: loadUser }] = useUser(
    u => ({
      accounts: u.accounts,
      email: u.email,
      loginProvider: u.loginProvider
    })
  );
  const [error, setError] = useState(null);

  const onConnectSuccess = async () => {
    setError(false);
    const user = await fetchLoggedInUser();
    loadUser(user);
  };

  const onConnectError = err => {
    const { message, level } = getConnectError(err);
    setError({ message, level });
  };

  const content = useMemo(
    () => {
      if (!accounts.length) {
        return <NoAccounts enterprise={enterprise} />;
      } else {
        return (
          <SomeAccounts
            accounts={accounts}
            primaryEmail={email}
            loginProvider={loginProvider}
            onboarding={onboarding}
          />
        );
      }
    },
    [accounts, email, enterprise, loginProvider, onboarding]
  );
  // show the provider buttons if user has yet
  // to add an account during onboarding, or if
  // not onboarding then always show
  const showButtons = useMemo(
    () => {
      return !onboarding || !accounts.length;
    },
    [accounts.length, onboarding]
  );

  const errorContent = useMemo(
    () => {
      if (!error) return null;
      return (
        <FormNotification
          error={error.level === 'error'}
          warning={error.level === 'warning'}
        >
          {error.message}
        </FormNotification>
      );
    },
    [error]
  );

  return (
    <>
      {content}
      {showButtons ? (
        <AccountProviderButtons
          onSuccess={onConnectSuccess}
          onError={onConnectError}
          imapOptions={{
            opaque: true
          }}
        />
      ) : null}

      {errorContent}
    </>
  );
};

function NoAccounts({ enterprise = false }) {
  if (enterprise) {
    return (
      <p>
        If you want to start scanning for your subscriptions you can connect
        your own email account.
      </p>
    );
  }
  return (
    <p>
      To start scanning for your subscriptions you need to connect at least one
      email account.
    </p>
  );
}

function SomeAccounts({ accounts, primaryEmail, loginProvider, onboarding }) {
  const [, { update: updateUser }] = useUser();
  const [error, setError] = useState(false);

  const onClickRemoveAccount = async email => {
    try {
      setError(false);
      const updatedUser = await removeAccount(email);
      updateUser(updatedUser);
    } catch (err) {
      setError({
        message: `Something went wrong removing your account. Please try again or send us a message.`,
        level: 'error'
      });
    }
  };

  const errorContent = useMemo(
    () => {
      if (!error) return null;
      return (
        <FormNotification
          error={error.level === 'error'}
          warning={error.level === 'warning'}
        >
          {error.message}
        </FormNotification>
      );
    },
    [error]
  );

  return (
    <>
      {onboarding ? null : (
        <p>
          If you have multiple email accounts then we can scan all of them at
          once.
        </p>
      )}

      {loginProvider === 'password' ? null : (
        <p>
          You logged in with{' '}
          <TextImportant>
            {loginProvider === 'outlook'
              ? 'Microsoft'
              : _capitalize(loginProvider)}
          </TextImportant>
          , so this account is already connected.
        </p>
      )}
      <ConnectedAccountList
        showPrimary={false}
        accounts={accounts}
        primaryEmail={primaryEmail}
        loginProvider={loginProvider}
        onClickRemove={email => onClickRemoveAccount(email)}
      />
      {errorContent}
    </>
  );
}

async function removeAccount(email) {
  return request('/api/me', {
    method: 'PATCH',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ op: 'remove-account', value: email })
  });
}
