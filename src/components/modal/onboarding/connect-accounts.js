import React, { useMemo, useState } from 'react';

import AccountProviderButtons from '../../connect-account/providers';
import ConnectedAccountList from '../../connect-account/list';
import { FormNotification } from '../../form';
import { fetchLoggedInUser } from '../../../utils/auth';
import { getConnectError } from '../../../utils/errors';
import useUser from '../../../utils/hooks/use-user';

export default ({ onboarding = false }) => {
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
    const msg = getConnectError(err);
    setError(msg);
  };

  const content = useMemo(
    () => {
      if (!accounts.length) {
        return <NoAccounts />;
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
    [accounts, email, loginProvider, onboarding]
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

  return (
    <>
      {content}
      {showButtons ? (
        <AccountProviderButtons
          onSuccess={onConnectSuccess}
          onError={onConnectError}
        />
      ) : null}

      {error ? (
        <FormNotification error>
          Something went wrong connecting your account. Please try again or send
          us a message.
        </FormNotification>
      ) : null}
    </>
  );
};

function NoAccounts() {
  return (
    <p>
      To start scanning for your subscriptions you need to connect at least one
      email account.
    </p>
  );
}

function SomeAccounts({ accounts, primaryEmail, loginProvider, onboarding }) {
  return (
    <>
      {onboarding ? null : (
        <p>
          If you have multiple email accounts then we can scan all of them at
          once.
        </p>
      )}

      <p>So far you have connected these accounts;</p>
      <ConnectedAccountList
        accounts={accounts}
        primaryEmail={primaryEmail}
        loginProvider={loginProvider}
      />
    </>
  );
}
