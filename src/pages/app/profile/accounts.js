import './accounts.module.scss';

import {
  ExternalIcon,
  GoogleIcon,
  OutlookIcon
} from '../../../components/icons';
import React, { useState } from 'react';

import Button from '../../../components/btn';
import ProfileLayout from './layout';
import { TextImportant } from '../../../components/text';
import WarningModal from '../../../components/modal/warning-modal';
// import cx from 'classnames';
import useUser from '../../../utils/hooks/use-user';

const revokeUrlForGoogle =
  'https://security.google.com/settings/security/permissions';
const revokeUrlForOutlook = 'https://account.live.com/consent/Manage';

export default () => {
  const [
    { email: primaryEmail, accounts = [] },
    { update: updateUser }
  ] = useUser(({ accounts, email }) => ({
    accounts,
    email
  }));

  const [showWarningModal, toggleWarningModal] = useState(false);
  const [warningModalData, setWarningModalData] = useState(null);
  const [connecting, toggleConnecting] = useState(false);
  const [revoking, toggleRevoking] = useState({});

  const onClickConnectAccount = async provider => {
    toggleConnecting(true);
    const updatedUser = await connectAccount(provider);
    updateUser(updatedUser);
    toggleConnecting(false);
  };

  const onClickRevokeAccount = async email => {
    const account = accounts.find(e => e.email === email);
    setWarningModalData({ email, provider: account.provider });
    toggleWarningModal(true);
  };

  const onClickWarningConfirm = async ({ email }) => {
    toggleRevoking({
      ...revoking,
      [email]: true
    });
    const updatedUser = await revokeAccount(email);
    updateUser(updatedUser);
    toggleRevoking({
      ...revoking,
      [email]: false
    });
  };

  return (
    <ProfileLayout pageName="Accounts">
      <div styleName="accounts-section">
        <h2>Connected accounts</h2>
        <ul styleName="account-list">
          {accounts.map(({ provider, email }) => (
            <li styleName="account" key={email}>
              <span styleName="email-container">
                {getIcon(provider)}
                <span styleName="email">
                  {email} {email === primaryEmail ? '(primary)' : ''}
                </span>
              </span>
              {email === primaryEmail ? null : (
                <Button
                  compact
                  muted
                  basic
                  fill
                  onClick={() => onClickRevokeAccount(email)}
                  loading={revoking[email]}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div styleName="accounts-section connect">
        <h2>Connect more accounts</h2>
        <a
          onClick={() => onClickConnectAccount('google')}
          styleName="connect-btn"
        >
          <GoogleIcon />
          <span styleName="text">Connect Google Account</span>
        </a>
        <a
          onClick={() => onClickConnectAccount('outlook')}
          href="/auth/outlook"
          styleName="connect-btn"
        >
          <OutlookIcon />
          <span styleName="text">Connect Outlook Account</span>
        </a>
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

async function connectAccount(provider) {
  console.log('connecting account', provider);
  console.warn('not yet implemented');
}

async function revokeAccount(email) {
  const resp = await fetch('/api/me', {
    method: 'PATCH',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ op: 'disconnect-account', value: email })
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
