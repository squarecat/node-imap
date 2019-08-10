import './accounts.module.scss';

import React, { useContext } from 'react';

import AccountProviderButtons from '../../../../components/connect-account/providers';
import { AlertContext } from '../../../../providers/alert-provider';
import ConnectButton from '../../../../components/connect-account/btn';
import ConnectedAccountList from '../../../../components/connect-account/list';
import { DatabaseContext } from '../../../../providers/db-provider';
import { ExternalIcon } from '../../../../components/icons';
import { ModalContext } from '../../../../providers/modal-provider';
import ProfileLayout from '../../../../app/profile/layout';
import { TextImportant } from '../../../../components/text';
import WarningModal from '../../../../components/modal/warning-modal';
import { fetchLoggedInUser } from '../../../../utils/auth';
import { getConnectError } from '../../../../utils/errors';
import request from '../../../../utils/request';
import useUser from '../../../../utils/hooks/use-user';

const revokeUrlForGoogle =
  'https://security.google.com/settings/security/permissions';
const revokeUrlForOutlook = 'https://account.live.com/consent/Manage';

const Accounts = () => {
  const { actions: alertActions } = useContext(AlertContext);
  const db = useContext(DatabaseContext);
  const [
    { accounts = [], primaryEmail, loginProvider, features },
    { update: updateUser, load: loadUser }
  ] = useUser(({ accounts, email, loginProvider, features }) => ({
    accounts,
    primaryEmail: email,
    loginProvider,
    features
  }));

  const { open: openModal } = useContext(ModalContext);

  const onClickRemoveAccount = async email => {
    const account = accounts.find(e => e.email === email);
    const warningModalData = { email, provider: account.provider };
    openModal(
      <WarningModal
        onConfirm={() => onClickWarningConfirm(account)}
        content={modalContent(warningModalData)}
        confirmText={'Confirm'}
      />
    );
  };

  const onClickWarningConfirm = async account => {
    const { email } = account;
    try {
      const updatedUser = await removeAccount(email);
      db.clear(account);
      updateUser(updatedUser);
      alertActions.setAlert({
        id: 'remove-account-success',
        level: 'success',
        message: `Successfully removed account.`,
        isDismissable: true,
        autoDismiss: true
      });
    } catch (err) {
      alertActions.setAlert({
        id: 'remove-account-error',
        level: 'error',
        message: `Something went wrong removing your account. Please try again or send us a message.`,
        isDismissable: true,
        autoDismiss: true
      });
    }
  };

  const onConnectSuccess = async () => {
    const user = await fetchLoggedInUser();
    loadUser(user);
    alertActions.setAlert({
      id: 'connect-account-success',
      level: 'success',
      message: `Successfully connected account.`,
      isDismissable: true,
      autoDismiss: true
    });
  };

  const onConnectError = reason => {
    const { message, level, actions } = getConnectError(reason);
    alertActions.setAlert({
      id: 'connect-account-error',
      level,
      message,
      isDismissable: true,
      autoDismiss: false,
      actions
    });
  };

  let connectedAccountsContent;

  if (!accounts.length) {
    if (features.includes('IMAP')) {
      connectedAccountsContent = (
        <p>
          You haven't connected any accounts yet. Connect your{' '}
          <TextImportant>Google</TextImportant>,{' '}
          <TextImportant>Microsoft</TextImportant> or{' '}
          <TextImportant>Other Mailbox</TextImportant> accounts below to start
          scanning your inboxes for subscription spam.
        </p>
      );
    } else {
      connectedAccountsContent = (
        <p>
          You haven't connected any accounts yet. Connect your{' '}
          <TextImportant>Google</TextImportant> or{' '}
          <TextImportant>Microsoft</TextImportant> accounts below to start
          scanning your inboxes for subscription spam.
        </p>
      );
    }
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
    <>
      <div styleName="accounts-section">
        <h2>Connected accounts</h2>
        {connectedAccountsContent}
      </div>

      <div styleName="accounts-section connect">
        <h2>Connect more accounts</h2>
        <AccountProviderButtons
          onSuccess={onConnectSuccess}
          onError={err => onConnectError(err)}
          hideImap={!features.includes('IMAP')}
        />
      </div>
    </>
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
  let content;
  if (provider === 'outlook') {
    content = (
      <p>
        While we will remove this account and any data associated with it,
        Microsoft don't provide a way to revoke our permissions automatically so
        you will need to do it manually by visiting your{' '}
        <a
          href={revokeUrlForOutlook}
          target="_blank"
          rel="noopener noreferrer"
          className="revoke-link"
        >
          <span>Microsoft Account Settings</span>
          <ExternalIcon padleft width={14} height={14} />
        </a>
      </p>
    );
  }
  if (provider === 'google') {
    content = (
      <p>
        We will also revoke our token to access this Google account. You can
        double check this by visiting your{' '}
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
    );
  }
  if (provider === 'imap') {
    content = (
      <p>
        We will completely remove all your IMAP details, including username and
        password from our systems.
      </p>
    );
  }

  return (
    <>
      <p>
        This will disconnect <TextImportant>{email}</TextImportant> from Leave
        Me Alone. You will no longer see subscription emails from this account.
      </p>
      {content}
    </>
  );
}

export default () => {
  return (
    <ProfileLayout pageName="Accounts">
      <Accounts />
    </ProfileLayout>
  );
};
