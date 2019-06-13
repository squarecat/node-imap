import React, { useState } from 'react';

import AccountProviderButtons from '../../connect-account/providers';
import ConnectedAccountList from '../../connect-account/list';
import { FormNotification } from '../../form';
import { fetchLoggedInUser } from '../../../utils/auth';
import { getConnectError } from '../../../utils/errors';
import useUser from '../../../utils/hooks/use-user';

export default () => {
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
  let content;
  const onConnectError = err => {
    const msg = getConnectError(err);
    setError(msg);
  };
  if (!accounts.length) {
    content = <NoAccounts />;
  } else {
    content = (
      <SomeAccounts
        accounts={accounts}
        primaryEmail={email}
        loginProvider={loginProvider}
      />
    );
  }

  return (
    <>
      {content}
      <AccountProviderButtons
        onSuccess={onConnectSuccess}
        onError={onConnectError}
      />
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

function SomeAccounts({ accounts, primaryEmail, loginProvider }) {
  return (
    <>
      <p>
        If you have multiple email accounts then we can scan all of them at
        once.
      </p>
      <p>So far you have connected these accounts;</p>
      <ConnectedAccountList
        accounts={accounts}
        primaryEmail={primaryEmail}
        loginProvider={loginProvider}
      />
    </>
  );
}
