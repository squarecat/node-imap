import './invite.module.scss';

import { FormGroup, InlineFormInput } from '..';
import React, { useCallback, useContext, useState } from 'react';

import { AlertContext } from '../../../providers/alert-provider';
import Button from '../../btn';
import CopyButton from '../../copy-to-clipboard';
import request from '../../../utils/request';
import useUser from '../../../utils/hooks/use-user';

export const InviteLink = React.memo(function InviteLink({ code }) {
  return (
    <div styleName="invite">
      <InlineFormInput
        smaller
        compact
        placeholder=""
        name="code"
        value={`${window.location.protocol}//${window.location.host}/i/${code}`}
        onChange={() => {}}
      >
        <CopyButton
          string={`${window.location.protocol}//${
            window.location.host
          }/i/${code}`}
          fill
          basic
          smaller
          inline
        >
          Copy link
        </CopyButton>
      </InlineFormInput>
    </div>
  );
});

export const InviteForm = React.memo(function InviteForm({
  organisationId,
  onSuccess = () => {}
}) {
  const alert = useContext(AlertContext);
  const [, { setOrganisationLastUpdated }] = useUser();

  const [email, setEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  const onClickInvite = useCallback(
    async () => {
      try {
        setSendingInvite(true);
        await sendOrganisationInvite(organisationId, email);
        setOrganisationLastUpdated(Date.now());
        setEmail('');
        alert.actions.setAlert({
          id: 'org-invite-success',
          level: 'success',
          message: `Successfully invited ${email}!`,
          isDismissable: true,
          autoDismiss: true
        });
        onSuccess(email);
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
    },
    [
      alert.actions,
      organisationId,
      setOrganisationLastUpdated,
      email,
      onSuccess
    ]
  );

  const onChange = useCallback(({ currentTarget }) => {
    setEmail(currentTarget.value);
  }, []);

  return (
    <form
      styleName="invite"
      id="invite-user-form"
      onSubmit={e => {
        e.preventDefault();
        onClickInvite();
        return false;
      }}
    >
      <FormGroup>
        <InlineFormInput
          smaller
          compact
          placeholder="Email address"
          name="email"
          value={email}
          type="email"
          onChange={onChange}
        >
          <Button
            fill
            basic
            smaller
            compact
            inline
            loading={sendingInvite}
            disabled={sendingInvite || !email}
            type="submit"
            as="button"
          >
            Invite
          </Button>
        </InlineFormInput>
      </FormGroup>
    </form>
  );
});

function sendOrganisationInvite(id, email) {
  return request(`/api/organisation/${id}/invite`, {
    method: 'PATCH',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ op: 'add', value: email })
  });
}
