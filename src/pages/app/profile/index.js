import './account.module.scss';

import React, { useState } from 'react';

import Button from '../../../components/btn';
import ProfileLayout from './layout';
import { TextImportant } from '../../../components/text';
import WarningModal from '../../../components/modal/warning-modal';
import request from '../../../utils/request';
import useUser from '../../../utils/hooks/use-user';

export default () => {
  const [{ email }] = useUser(u => ({
    email: u.email
  }));
  const [showWarningModal, toggleWarningModal] = useState(false);
  const [warningModalAction, setWarningModalAction] = useState(null);
  const [warningModalContent, setWarningModalContent] = useState(null);
  const [loading, toggleLoading] = useState(false);

  const clearLocalStorage = () => {
    localStorage.clear();
  };

  const deactivateUserAccount = async () => {
    toggleLoading(true);
    clearLocalStorage();
    try {
      await deactivateAccount();
      setTimeout(() => {
        window.location.href = '/goodbye';
      }, 300);
    } catch (err) {
      toggleLoading(false);
      console.error('failed to deactivate account');
      console.error(err);
    }
  };

  const onClickClear = () => {
    setWarningModalAction('clear');
    setWarningModalContent(clearModalContent);
    toggleWarningModal(true);
  };

  const onClickDelete = () => {
    setWarningModalAction('delete');
    setWarningModalContent(deleteModalContent);
    toggleWarningModal(true);
  };

  const onClickWarningConfirm = () => {
    if (warningModalAction === 'delete') {
      deactivateUserAccount();
    } else if (warningModalAction === 'clear') {
      clearLocalStorage();
    }
    setWarningModalAction(null);
  };

  return (
    <ProfileLayout pageName="Account">
      <div styleName="account-section details">
        <h2>Details</h2>
        <p>
          Signed in with: <TextImportant>{email}</TextImportant>
        </p>
      </div>

      <div styleName="account-section">
        <h2>Clear Local Data</h2>
        <p>
          We do not store any of your emails, everything is stored on your
          client. If you are having problems with a scan you can try clearing
          your local emails.
        </p>
        <Button compact basic onClick={() => onClickClear()}>
          Clear Local Emails
        </Button>
      </div>

      <div styleName="account-section">
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
        <p>
          If you still want to delete your account this action will delete all
          of your data, revoke your API key, and sign you out.
        </p>

        <Button compact basic loading={loading} onClick={() => onClickDelete()}>
          Deactivate Account
        </Button>
      </div>
      {showWarningModal ? (
        <WarningModal
          onClose={() => toggleWarningModal(false)}
          onClickConfirm={() => {
            toggleWarningModal(false);
            onClickWarningConfirm();
          }}
          content={warningModalContent}
          confirmText={
            warningModalAction === 'delete'
              ? 'Yes delete everything'
              : 'Confirm'
          }
        />
      ) : null}
    </ProfileLayout>
  );
};

const clearModalContent = (
  <>
    <p>
      <TextImportant>WARNING:</TextImportant> this will remove all of the data
      from your last scan. If it has been more than 24 hours you will be unable
      to run this scan again.
    </p>
    <p>If you continue to have problems please contact support.</p>
  </>
);

const deleteModalContent = (
  <>
    <p>
      This will delete <TextImportant>ALL OF YOUR DATA</TextImportant> including
      your account details, scan history, favorite senders, reminders, and
      referral data.
    </p>
    <p>
      You are not tied to our service in any way. Any spam email lists you
      unsubscribed from are gone forever.
    </p>
  </>
);

async function deactivateAccount() {
  try {
    return request('/api/user/me', {
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
