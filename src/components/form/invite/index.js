import './invite.module.scss';

import { FormGroup, FormTextarea, InlineFormInput } from '..';
import React, { useCallback, useContext, useState } from 'react';

import { AlertContext } from '../../../providers/alert-provider';
import Button from '../../btn';
import CopyButton from '../../copy-to-clipboard';
import InviteModal from '../../modal/invite';
import { ModalContext } from '../../../providers/modal-provider';
import _flatten from 'lodash.flatten';
import _uniq from 'lodash.uniq';
import request from '../../../utils/request';
import useUser from '../../../utils/hooks/use-user';

export const InviteLink = React.memo(function InviteLink({ code }) {
  return (
    <div styleName="invite">
      <InlineFormInput
        smaller
        compact
        nointeract
        placeholder=""
        name="code"
        value={`${window.location.protocol}//${window.location.host}/i/${code}`}
        onChange={() => {}}
      >
        <CopyButton
          string={`${window.location.protocol}//${window.location.host}/i/${code}`}
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

  const onClickInvite = useCallback(async () => {
    try {
      setSendingInvite(true);
      await sendOrganisationInvite(organisationId, [email]);
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
  }, [
    alert.actions,
    organisationId,
    setOrganisationLastUpdated,
    email,
    onSuccess
  ]);

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

export const InviteFormMultiple = React.memo(function InviteForm({
  organisationId,
  onSuccess = () => {}
}) {
  const alert = useContext(AlertContext);
  const { open: openModal } = useContext(ModalContext);
  const [, { setOrganisationLastUpdated }] = useUser();

  const [text, setText] = useState('');
  const [sendingInvites, setSendingInvites] = useState(false);

  const onClickInvite = useCallback(() => {
    const emails = parseEmails(text);
    openModal(
      <InviteModal emails={emails} onConfirm={() => onInvite(emails)} />
    );
  }, [text, openModal, onInvite]);

  const onInvite = useCallback(
    async emails => {
      try {
        setSendingInvites(true);
        await sendOrganisationInvite(organisationId, emails);
        setOrganisationLastUpdated(Date.now());
        setText('');
        alert.actions.setAlert({
          id: 'org-invite-success',
          level: 'success',
          message: `Successfully invited ${emails.length} team ${
            emails.length === 1 ? 'member' : 'members'
          }!`,
          isDismissable: true,
          autoDismiss: true
        });
        onSuccess(emails);
      } catch (err) {
        alert.actions.setAlert({
          id: 'org-invite-error',
          level: 'error',
          message: `Error sending invites. Please try again or send us a message.`,
          isDismissable: true,
          autoDismiss: true
        });
      } finally {
        setSendingInvites(false);
      }
    },
    [alert.actions, organisationId, setOrganisationLastUpdated, text]
  );

  const onChange = useCallback(({ currentTarget }) => {
    setText(currentTarget.value);
  }, []);

  return (
    <form
      styleName="invite"
      id="invite-users-multiple-form"
      onSubmit={e => {
        e.preventDefault();
        onClickInvite();
        return false;
      }}
    >
      <FormGroup>
        <FormTextarea
          placeholder="Invite team members by email address, multiple addreses should be comma separated..."
          name="emails"
          value={text}
          onChange={onChange}
        />
        <Button
          fill
          basic
          smaller
          compact
          inline
          loading={sendingInvites}
          disabled={sendingInvites || !text}
          type="submit"
          as="button"
        >
          Send Invites
        </Button>
      </FormGroup>
    </form>
  );
});

function sendOrganisationInvite(id, emails) {
  return request(`/api/organisation/${id}/invite`, {
    method: 'PATCH',
    body: JSON.stringify({ op: 'add', value: emails })
  });
}

function parseEmails(str) {
  const parsed = _uniq(
    _flatten(
      str
        .trim()
        .split(',')
        .map(d => d.trim())
        .filter(d => d.includes('@') && d.includes('.'))
        .map(d =>
          d
            .trim()
            .split(' ')
            .filter(d => d.includes('@') && d.includes('.'))
        )
    )
  );
  return parsed;
}
