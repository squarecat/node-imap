import './accounts.module.scss';

import {
  ExternalIcon,
  GoogleIcon,
  OutlookIcon
} from '../../../../components/icons';
import React, { useEffect, useState } from 'react';

import Button from '../../../../components/btn';
import { FormError } from '../../../../components/form';
import ProfileLayout from '../layout';
import { TextImportant } from '../../../../components/text';
import WarningModal from '../../../../components/modal/warning-modal';
import { fetchLoggedInUser } from '../../../../utils/auth';
import useUser from '../../../../utils/hooks/use-user';

const revokeUrlForGoogle =
  'https://security.google.com/settings/security/permissions';
const revokeUrlForOutlook = 'https://account.live.com/consent/Manage';

export default () => {
  const [
    { primaryEmail, accounts = [] },
    { update: updateUser, load: loadUser }
  ] = useUser(({ accounts, email, loginProvider }) => ({
    accounts,
    primaryEmail: loginProvider === 'password' ? null : email
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
    const updatedUser = await removeAccount(email);
    updateUser(updatedUser);
    toggleRemovingAccount({
      ...removingAccount,
      [email]: false
    });
  };

  const onConnectSuccess = async () => {
    setError(false);
    const user = await fetchLoggedInUser();
    loadUser(user);
  };

  const onConnectError = () => {
    setError(true);
  };

  return (
    <ProfileLayout pageName="Accounts">
      <div styleName="accounts-section">
        <h2>Connected accounts</h2>
        {!accounts.length ? (
          <p>
            You haven't connected any accounts yet. Connect your Google or
            Outlook accounts below to start scanning your inboxes for
            subscription spam.
          </p>
        ) : (
          <ul styleName="account-list">
            {accounts.map(account => {
              const isPrimary = primaryEmail === account.email;
              return (
                <li styleName="account" key={account.id}>
                  <span styleName="email-container">
                    {getIcon(account.provider)}
                    <span styleName="email">
                      {account.email} {isPrimary ? '(primary)' : ''}
                    </span>
                  </span>
                  {isPrimary ? null : (
                    <Button
                      compact
                      muted
                      basic
                      fill
                      onClick={() => onClickRemoveAccount(account.email)}
                      loading={removingAccount[account.email]}
                    >
                      Remove
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
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
        {error ? (
          <FormError>
            Something went wrong connecting your account. Please try again or
            send us a message.
          </FormError>
        ) : null}
      </div>
      {showWarningModal ? (
        <WarningModal
          onClose={() => toggleWarningModal(false)}
          onClickConfirm={() => {
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
  const resp = await fetch('/api/me', {
    method: 'PATCH',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ op: 'remove-account', value: email })
  });
  return resp.json();
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

function getIcon(provider) {
  if (provider === 'google') return <GoogleIcon width="16" height="16" />;
  if (provider === 'outlook') return <OutlookIcon width="16" height="16" />;
}

let windowObjectReference = null;
let previousUrl = null;
const strWindowFeatures = [
  'height=700',
  'width=600',
  'top=100',
  'left=100',
  // A dependent window closes when its parent window closes.
  'dependent=yes',
  // hide menubars and toolbars for the simplest popup
  'menubar=no',
  'toolbar=no',
  'location=yes',
  // enable for accessibility
  'resizable=yes',
  'scrollbars=yes',
  'status=yes',
  // chrome specific
  'chrome=yes',
  'centerscreen=yes'
].join(',');

const ConnectButton = ({ provider, onSuccess, onError }) => {
  useEffect(() => {
    return function cleanup() {
      window.removeEventListener('message', receiveMessage);
    };
  });

  const receiveMessage = event => {
    // Do we trust the sender of this message?  (might be
    // different from what we originally opened, for example).
    if (event.origin !== process.env.BASE_URL) {
      return;
    }

    if (event.data === 'error') {
      return onError();
    }

    return onSuccess();
  };

  const openSignInWindow = (url, name) => {
    window.removeEventListener('message', receiveMessage);

    if (windowObjectReference === null || windowObjectReference.closed) {
      windowObjectReference = window.open(url, name, strWindowFeatures);
    } else if (previousUrl !== url) {
      windowObjectReference = window.open(url, name, strWindowFeatures);
      windowObjectReference.focus();
    } else {
      windowObjectReference.focus();
    }

    window.addEventListener(
      'message',
      event => receiveMessage(event, provider),
      false
    );
    previousUrl = url;
  };

  if (provider === 'google') {
    return (
      <a
        href="/auth/google/connect"
        target="SignInWindow"
        onClick={() => {
          openSignInWindow('/auth/google/connect', 'SignInWindow');
          return false;
        }}
        styleName="connect-btn"
      >
        <GoogleIcon />
        <span styleName="text">Connect Google account</span>
      </a>
    );
  } else if (provider === 'outlook') {
    return (
      <a
        href="/auth/outlook/connect"
        target="SignInWindow"
        onClick={() => {
          openSignInWindow('/auth/outlook/connect', 'SignInWindow');
          return false;
        }}
        styleName="connect-btn"
      >
        <OutlookIcon />
        <span styleName="text">Connect Outlook account</span>
      </a>
    );
  } else {
    return null;
  }
};
