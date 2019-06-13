import './organisation.module.scss';

import {
  FormGroup,
  FormInput,
  FormNotification
} from '../../../../components/form';
import React, { useState } from 'react';

import Button from '../../../../components/btn';
import CopyButton from '../../../../components/copy-to-clipboard';
import request from '../../../../utils/request';

function InviteForm({ organisation }) {
  const [state, setState] = useState({
    email: '',
    loading: false,
    error: false,
    sent: false
  });

  const { id, inviteCode, allowAnyUserWithCompanyEmail } = organisation;

  const onSubmit = async () => {
    try {
      setState({
        ...state,
        loading: true,
        error: false,
        sent: false
      });

      await sendInvite(id, state.email);
      setTimeout(() => {
        setState({
          ...state,
          loading: false,
          error: false,
          sent: true
        });
      }, 300);
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setState({
          ...state,
          loading: false,
          error: true,
          sent: false
        });
      }, 300);
    }
  };

  return (
    <div styleName="organisation-section">
      <h2>Invite Users</h2>
      {allowAnyUserWithCompanyEmail ? (
        <p>
          Any user with your company domain can join. Instead of inviting them
          all, you can share this link:
          <CopyButton
            string={`${window.location.host}/i/${inviteCode}`}
            muted
            outlined
            stretch
            fill
            basic
            smaller
            inline
          >
            {window.location.host}/i/{inviteCode} - Copy link
          </CopyButton>
        </p>
      ) : null}
      <p>
        You can invite any member inside or outside of your organisation by
        email address. Members will be able to sign-in or connect an account
        with this email address.
      </p>
      <form
        id="invite-user-form"
        onSubmit={e => {
          e.preventDefault();
          return onSubmit();
        }}
      >
        <FormGroup>
          <FormInput
            smaller
            required
            placeholder="Email address to invite"
            value={state.email}
            name="name"
            onChange={e => {
              setState({ ...state, email: e.currentTarget.value });
            }}
          />
        </FormGroup>
        <Button
          basic
          compact
          stretch
          loading={state.loading}
          disabled={state.loading || !state.email}
          type="submit"
          as="button"
        >
          Send Invite
        </Button>
        {state.sent ? <FormNotification success>Sent!</FormNotification> : null}
        {state.error ? (
          <FormNotification error>
            Something went wrong, your invite has not sent.
          </FormNotification>
        ) : null}
      </form>
    </div>
  );
}

function sendInvite(id, email) {
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
