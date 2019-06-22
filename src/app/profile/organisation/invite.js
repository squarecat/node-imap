import './org.module.scss';

import { FormGroup, InlineFormInput } from '../../../components/form';
import React, { useContext, useMemo, useState } from 'react';

import { AlertContext } from '../../../providers/alert-provider';
import Button from '../../../components/btn';
import CopyButton from '../../../components/copy-to-clipboard';
import request from '../../../utils/request';
import useUser from '../../../utils/hooks/use-user';

function InviteForm({ organisation }) {
  const alert = useContext(AlertContext);
  const [, { setOrganisationLastUpdated }] = useUser();

  const [email, setEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  const content = useMemo(
    () => {
      if (!organisation) {
        return null;
      }
      const { id, inviteCode, allowAnyUserWithCompanyEmail } = organisation;
      const onClickInvite = async () => {
        try {
          setSendingInvite(true);
          await sendOrganisationInvite(id, email);
          setEmail('');
          setOrganisationLastUpdated(Date.now());
          alert.actions.setAlert({
            id: 'org-invite-success',
            level: 'success',
            message: `Successfully invited ${email}!`,
            isDismissable: true,
            autoDismiss: true
          });
        } catch (err) {
          alert.actions.setAlert({
            id: 'org-invite-error',
            level: 'error',
            message: `Error inviting ${email}. Please try again or send us a message.`,
            isDismissable: true,
            autoDismiss: true
          });
        } finally {
          setSendingInvite(false);
        }
      };
      return (
        <div styleName="organisation-section">
          <h2>Invite Users</h2>
          {allowAnyUserWithCompanyEmail ? (
            <>
              <p>
                Any user with your company domain can join. Instead of inviting
                them all, you can share this link:
              </p>
              <div styleName="invite">
                <InlineFormInput
                  smaller
                  compact
                  placeholder=""
                  name="inviteCode"
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
                onChange={({ currentTarget }) => {
                  setEmail(currentTarget.value);
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
    },
    [alert, email, organisation, sendingInvite, setOrganisationLastUpdated]
  );

  return content;
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
