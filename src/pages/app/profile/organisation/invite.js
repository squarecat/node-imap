import './organisation.module.scss';

import { FormGroup, InlineFormInput } from '../../../../components/form';
import React, { useState, useCallback, useContext } from 'react';

import Button from '../../../../components/btn';
import CopyButton from '../../../../components/copy-to-clipboard';
import request from '../../../../utils/request';
import { AlertContext } from '../../../../providers/alert-provider';

function InviteForm({ organisation }) {
  const { actions: alertActions } = useContext(AlertContext);
  const { id, inviteCode, allowAnyUserWithCompanyEmail } = organisation;

  const [email, setEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  const onClickInvite = useCallback(
    async () => {
      try {
        setSendingInvite(true);
        await sendOrganisationInvite(id, email);
        alertActions.setAlert({
          id: 'org-invite-success',
          level: 'success',
          message: `Successfully invited ${email}!`,
          isDismissable: true,
          autoDismiss: true
        });
      } catch (err) {
        alertActions.setAlert({
          id: 'org-invite-error',
          level: 'error',
          message: `Error inviting ${email}. Please try again or send us a message.`,
          isDismissable: true,
          autoDismiss: true
        });
      } finally {
        setSendingInvite(false);
      }
    },
    [email, alertActions]
  );

  return (
    <div styleName="organisation-section">
      <h2>Invite Users</h2>
      {allowAnyUserWithCompanyEmail ? (
        <>
          <p>
            Any user with your company domain can join. Instead of inviting them
            all, you can share this link:
          </p>
          <div styleName="invite">
            <InlineFormInput
              smaller
              compact
              placeholder="Email address"
              name="email"
              value={`${window.location.protocol}//${
                window.location.host
              }/i/${inviteCode}`}
              onChange={() => {}}
            >
              <CopyButton
                string={`${window.location.protocol}//${
                  window.location.host
                }/i/${inviteCode}`}
                fill
                basic
                smaller
                inline
              >
                Copy link
              </CopyButton>
            </InlineFormInput>
          </div>
        </>
      ) : null}
      <p>
        You can invite any member inside or outside of your organisation by
        email address. Members will be able to sign-in or connect an account
        with this email address.
      </p>
      <form styleName="invite" id="invite-user-form">
        <FormGroup>
          <InlineFormInput
            smaller
            compact
            placeholder="Email address"
            name="email"
            value={email}
            onChange={e => {
              setEmail(e.currentValue.target);
            }}
          >
            <Button
              fill
              basic
              smaller
              compact
              inline
              loading={sendingInvite}
              disabled={sendingInvite || !email}
              onClick={onClickInvite}
            >
              Invite
            </Button>
          </InlineFormInput>
        </FormGroup>
      </form>
    </div>
  );
}

function sendOrganisationInvite(id, email) {
  return request(`/api/organisation/${id}/invite`, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ email })
  });
}

export default InviteForm;
