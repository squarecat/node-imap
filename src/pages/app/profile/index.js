import './profile.module.scss';

import React, { useCallback, useContext, useState } from 'react';

import Button from '../../../components/btn';
import { DatabaseContext } from '../../../app/db-provider';
import { ModalContext } from '../../../providers/modal-provider';
import ProfileLayout from './layout';
import { TextImportant } from '../../../components/text';
import WarningModal from '../../../components/modal/warning-modal';
import request from '../../../utils/request';
import useUser from '../../../utils/hooks/use-user';

export default () => {
  const [{ email }] = useUser(u => ({
    email: u.email
  }));
  return (
    <ProfileLayout pageName="Profile">
      <div styleName="section details">
        <h2>Details</h2>
        <p>
          Signed in with: <TextImportant>{email}</TextImportant>
        </p>
      </div>
      <DangerZone />
    </ProfileLayout>
  );
};

function DangerZone() {
  const [loading, toggleLoading] = useState(false);

  const { open: openModal } = useContext(ModalContext);
  const db = useContext(DatabaseContext);

  const onClickClear = useCallback(
    () =>
      openModal(
        <WarningModal
          onConfirm={() => db.clear()}
          content={
            <>
              <p>
                <TextImportant>WARNING:</TextImportant> this will remove all of
                the data from your scan. Re-running the full scan may take a few
                minutes.
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
      ),
    [openModal, db]
  );

  const onClickDelete = useCallback(
    () => {
      const deactivateUserAccount = async () => {
        toggleLoading(true);
        await db.clear();
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
    },
    [openModal, db]
  );

  return (
    <>
      <div styleName="section">
        <h2>Clear Local Data</h2>
        <p>
          We do not store any of your emails, everything is stored in your
          browser. If you are having problems with a scan you can try clearing
          this data.
        </p>
        <Button compact basic onClick={() => onClickClear()}>
          Clear Local Emails
        </Button>
      </div>

      <div styleName="section">
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
    </>
  );
}
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
