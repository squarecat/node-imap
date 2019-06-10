import './accounts.module.scss';

import React, { useState } from 'react';

import ConnectButton from '../../../../components/connect-account/btn';
import ConnectedAccountList from '../../../../components/connect-account/list';
import { ExternalIcon } from '../../../../components/icons';
import { FormNotification } from '../../../../components/form';
import ProfileLayout from '../layout';
import { TextImportant } from '../../../../components/text';
import WarningModal from '../../../../components/modal/warning-modal';
import { fetchLoggedInUser } from '../../../../utils/auth';
import request from '../../../../utils/request';
import useUser from '../../../../utils/hooks/use-user';

const revokeUrlForGoogle =
  'https://security.google.com/settings/security/permissions';
const revokeUrlForOutlook = 'https://account.live.com/consent/Manage';

export default () => {
  const [
    { accounts = [], primaryEmail, loginProvider },
    { update: updateUser, load: loadUser }
  ] = useUser(({ accounts, email, loginProvider }) => ({
    accounts,
    primaryEmail: email,
    loginProvider
  }));

  const [showWarningModal, toggleWarningModal] = useState(false);
  const [warningModalData, setWarningModalData] = useState(null);
  const [error, setError] = useState(false);
  const [removingAccount, toggleRemovingAccount] = useState({});

  const onClickRemoveAccount = async email => {
    const account = accounts.find(e => e.email === email);
    setWarningModalData({ email, provider: account.provider });
    toggleWarningModal(true);
  };

  const onClickWarningConfirm = async ({ email }) => {
    toggleRemovingAccount({
      ...removingAccount,
      [email]: true
    });
    try {
      const updatedUser = await removeAccount(email);
      updateUser(updatedUser);
    } catch (err) {
      setError(
        `Something went wrong removing your account. Please try again or send us a message.`
      );
    } finally {
      toggleRemovingAccount({
        ...removingAccount,
        [email]: false
      });
    }
  };

  const onConnectSuccess = async () => {
    setError(false);
    const user = await fetchLoggedInUser();
    loadUser(user);
  };

  const onConnectError = () => {
    setError(
      `Something went wrong connecting your account. Please try again or send us a message.`
    );
  };

  let connectedAccountsContent;

  if (!accounts.length) {
    connectedAccountsContent = (
      <p>
        You haven't connected any accounts yet. Connect your Google or Outlook
        accounts below to start scanning your inboxes for subscription spam.
      </p>
    );
  } else {
    connectedAccountsContent = (
      <ConnectedAccountList
        accounts={accounts}
        primaryEmail={primaryEmail}
        loginProvider={loginProvider}
        onClickRemove={email => onClickRemoveAccount(email)}
      />
    );
  }

  return (
    <ProfileLayout pageName="Accounts">
      <div styleName="accounts-section">
        <h2>Connected accounts</h2>
        {connectedAccountsContent}
      </div>

      <div styleName="accounts-section connect">
        <h2>Connect more accounts</h2>
        <ConnectButton
          provider="google"
          onSuccess={() => onConnectSuccess()}
          onError={() => onConnectError()}
        />
        <ConnectButton
          provider="outlook"
          onSuccess={() => onConnectSuccess()}
          onError={() => onConnectError()}
        />
        {error ? <FormNotification error>{error}</FormNotification> : null}
      </div>
      {showWarningModal ? (
        <WarningModal
          shown={true}
          onClose={() => toggleWarningModal(false)}
          onConfirm={() => {
            toggleWarningModal(false);
            onClickWarningConfirm(warningModalData);
          }}
          content={modalContent(warningModalData)}
          confirmText={'Confirm'}
        />
      ) : null}
    </ProfileLayout>
  );
};

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

function modalContent({ email, provider }) {
  return (
    <>
      <p>
        This will disconnect <TextImportant>{email}</TextImportant> from Leave
        Me Alone. You will no longer see subscription emails from this account.
      </p>
      {provider === 'outlook' ? (
        <p>
          While we will remove this account and any data associated with it, you
          need to revoke Leave Me Alone Outlook App permissions manually by
          visiting your{' '}
          <a
            href={revokeUrlForOutlook}
            target="_blank"
            rel="noopener noreferrer"
            className="revoke-link"
          >
            <span>Outlook Account Settings</span>
            <ExternalIcon padleft width={14} height={14} />
          </a>
        </p>
      ) : (
        <p>
          We will revoke Leave Me Alone Google App permissions. You can check by
          visiting your{' '}
          <a
            href={revokeUrlForGoogle}
            target="_blank"
            rel="noopener noreferrer"
            className="revoke-link"
          >
            <span>Google Account Settings</span>
            <ExternalIcon padleft width={14} height={14} />
          </a>
        </p>
      )}
    </>
  );
}
