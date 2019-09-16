import './profile.module.scss';

import { GoogleIcon, KeyIcon, MicrosoftIcon } from '../../../components/icons';
import React, { useCallback, useContext, useState } from 'react';

import { AlertContext } from '../../../providers/alert-provider';
import Button from '../../../components/btn';
import { DatabaseContext } from '../../../providers/db-provider';
import { ModalContext } from '../../../providers/modal-provider';
import ProfileLayout from '../../../app/profile/layout';
import { TextImportant } from '../../../components/text';
import WarningModal from '../../../components/modal/warning-modal';
import { getBasicError } from '../../../utils/errors';
import request from '../../../utils/request';
import useUser from '../../../utils/hooks/use-user';

export default () => {
  const [
    {
      email,
      unsubCount,
      organisationAdmin,
      loginProvider,
      organisation,
      accountsCount
    }
  ] = useUser(u => ({
    email: u.email,
    organisationAdmin: u.organisationAdmin,
    loginProvider: u.loginProvider,
    unsubCount: u.unsubCount,
    organisation: u.organisation,
    accountsCount: u.accounts.length
  }));
  return (
    <ProfileLayout pageName="Profile">
      <div styleName="section">
        <h2>Details</h2>

        <p styleName="email-container">
          <span>Signed in with: </span>
          {getProviderIcon(loginProvider)}
          <span styleName="email">
            <TextImportant>{email}</TextImportant>
          </span>
        </p>
        <p>
          You have unsubscribed from a total of{' '}
          <TextImportant>{unsubCount}</TextImportant> emails.
        </p>
      </div>

      <DangerZone
        organisationAdmin={organisationAdmin}
        organisation={organisation}
      />
    </ProfileLayout>
  );
};

function DangerZone({ organisationAdmin, organisation }) {
  const [loading, toggleLoading] = useState(false);

  const { open: openModal } = useContext(ModalContext);
  const db = useContext(DatabaseContext);
  const { actions: alertActions } = useContext(AlertContext);

  const onClickClear = useCallback(() => {
    function onConfirm() {
      db.clear();
      alertActions.setAlert({
        id: 'deactivate-account-success',
        level: 'success',
        message: `Your local email data has been cleared!`,
        isDismissable: true,
        autoDismiss: true
      });
    }
    openModal(
      <WarningModal
        onConfirm={onConfirm}
        content={
          <>
            <p>
              <TextImportant>WARNING:</TextImportant> this will remove all of
              the local email data that you see on the mail page. Re-scanning
              will automatically take place when you return to that page but may
              take a few minutes.
            </p>
            <p>
              If you continue to have problems after this then please contact
              support.
            </p>
          </>
        }
        confirmText="Confirm"
      />,
      {
        dismissable: true
      }
    );
  }, [openModal, db]);

  const onClickDelete = useCallback(() => {
    const deactivateUserAccount = async () => {
      try {
        toggleLoading(true);
        await db.clear();
        await deactivateAccount();
        setTimeout(() => {
          window.location.href = '/goodbye';
        }, 300);
      } catch (err) {
        toggleLoading(false);
        const message = getBasicError(err);
        alertActions.setAlert({
          id: 'deactivate-account-error',
          level: 'error',
          message,
          isDismissable: true,
          autoDismiss: false
        });
      }
    };
    openModal(
      <WarningModal
        onConfirm={() => deactivateUserAccount()}
        content={
          <>
            <p>
              <TextImportant>WARNING:</TextImportant>
              This will delete <TextImportant>
                ALL OF YOUR DATA
              </TextImportant>{' '}
              including your account details, scan history, favorite senders,
              reminders, and referral data.
            </p>
            <p>
              However, you are not tied to our service in any way. Any mailing
              lists you unsubscribed from are gone forever.
            </p>
          </>
        }
        confirmText="Yes delete everything"
      />,
      {
        dismissable: true
      }
    );
  }, [openModal, db]);

  return (
    <>
      <div styleName="section">
        <h2 styleName="danger-zone-title">Danger Zone</h2>

        <h2>Clear Local Data</h2>
        <p>
          We do not store any of your emails, everything is stored in your
          browser. If you are having problems with a scan you can try clearing
          this data.
        </p>
        <Button compact basic onClick={() => onClickClear()}>
          Clear Local Emails
        </Button>

        <span styleName="separator" />

        <h2>Deactivate Account</h2>
        <p styleName="warning">
          We NEVER store the content of your emails in any form.
        </p>
        <p>
          We do store metadata of your emails in order to identify if you have
          unsubscribed from a subscription in a previous scan. This is limited
          to recipient and sender email addresses, and a timestamp, and is
          encrypted.
        </p>

        {organisationAdmin ? (
          <TextImportant>
            You are an admin of the {organisation.name} team. If you wish to
            deactivate your account please contact us.
          </TextImportant>
        ) : (
          <>
            <p>
              If you still want to delete your account this action will delete
              all of your data, revoke your API key, and sign you out.
            </p>
            <Button
              compact
              basic
              loading={loading}
              onClick={() => onClickDelete()}
            >
              Deactivate Account
            </Button>
          </>
        )}
      </div>
    </>
  );
}
async function deactivateAccount() {
  try {
    return request('/api/me', {
      credentials: 'same-origin',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

function getProviderIcon(provider) {
  if (provider === 'password')
    return <KeyIcon inline width="16" height="16" style={{ top: '-1px' }} />;
  if (provider === 'google') return <GoogleIcon width="16" height="16" />;
  if (provider === 'outlook') return <MicrosoftIcon width="16" height="16" />;
}
