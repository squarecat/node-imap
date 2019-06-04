import './organisation.module.scss';

import { FormCheckbox, FormGroup, FormInput } from '../../../components/form';
import React, { useEffect, useState } from 'react';
import Table, { TableCell, TableRow } from '../../../components/table';

import Button from '../../../components/btn';
import ErrorBoundary from '../../../components/error-boundary';
import ProfileLayout from './layout';
import { TextImportant } from '../../../components/text';
import cx from 'classnames';
import relative from 'tiny-relative-date';
import request from '../../../utils/request';
import { useAsync } from '../../../utils/hooks';
import useUser from '../../../utils/hooks/use-user';

function Organisation() {
  const [{ organisationId, organisationAdmin }] = useUser(u => {
    return {
      organisationId: u.organisationId,
      organisationAdmin: u.organisationAdmin
    };
  });
  console.log('organisationId', organisationId);

  const { value: organisation = {}, loading } = useAsync(fetchOrganisation, [
    organisationId
  ]);
  const { value: stats = [], loadingStats } = useAsync(fetchStats, [
    organisationId
  ]);

  const {
    name,
    active,
    currentUsers = [],
    invitedUsers = [],
    allowAnyUserWithCompanyEmail,
    domain
  } = organisation;

  useEffect(
    () => {
      if (!loading && organisation) {
        setState({
          ...state,
          allowAnyUserWithCompanyEmail:
            organisation.allowAnyUserWithCompanyEmail
        });
      }
    },
    [loading]
  );

  const [state, setState] = useState({});
  const [toggling, setToggling] = useState(false);

  const onToggleSetting = async toggled => {
    setToggling(true);
    setState({ ...state, allowAnyUserWithCompanyEmail: toggled });
    await toggleOrganisationType(toggled);
    setToggling(false);
  };

  if (loading) return <span>Loading...</span>;

  return (
    <>
      <div styleName="organisation-section">
        <h2>{name}</h2>
        {organisationAdmin ? (
          <p>You are the admin of this organisation.</p>
        ) : null}
        <p>
          <span
            styleName={cx('org-status', {
              active
            })}
          >
            {active ? 'Active' : 'Inactive'}
          </span>{' '}
        </p>
        {active ? (
          <p>
            Your account is <TextImportant>active</TextImportant>. Organisation
            members can get unsubscribing!
          </p>
        ) : (
          <p>
            Your account is <TextImportant>inactive</TextImportant> because you
            have disabled it or you have not added any billing information.
          </p>
        )}
        <p>
          {currentUsers.length} seats used (billed at $4 per seat per month)
        </p>
        <p>{invitedUsers.length} invites pending</p>
      </div>
      <div styleName="organisation-section">
        <h2>Settings</h2>
        {allowAnyUserWithCompanyEmail ? (
          <>
            <p>
              Any user with the <TextImportant>{domain}</TextImportant> domain
              can join. This means they can sign-in and connect accounts with a{' '}
              {domain} email address.
            </p>
            <p>
              You can also invite users outside of your organisation using the
              form below.
            </p>
          </>
        ) : (
          <p>
            Only users you invite with the form below can join. This means{' '}
            <TextImportant>
              only email addresses on the invite list
            </TextImportant>{' '}
            can sign-in and be connected.
          </p>
        )}
        <FormCheckbox
          disabled={toggling}
          onChange={() => onToggleSetting(!state.allowAnyUserWithCompanyEmail)}
          checked={state.allowAnyUserWithCompanyEmail}
          label={`Allow any user with the ${domain} domain to join`}
        />
        {toggling ? <span>Saving...</span> : null}
      </div>
      <InviteForm
        organisationAdmin={organisationAdmin}
        onSendInvite={email => sendInvite(organisation.id, email)}
      />
      {organisationAdmin ? (
        <>
          <div styleName="organisation-section tabled">
            <div styleName="table-text-content">
              <h2>Current Users</h2>
            </div>
            {loadingStats ? (
              <span>Loading...</span>
            ) : (
              <Table>
                {stats.map(stat => (
                  <TableRow key={stat.id}>
                    <TableCell>{stat.email}</TableCell>
                    <TableCell>
                      {stat.numberOfUnsubscribes} unsubscribes
                    </TableCell>
                    <TableCell>Joined {relative(stat.dateJoined)}</TableCell>
                  </TableRow>
                ))}
              </Table>
            )}
          </div>
          <div styleName="organisation-section tabled">
            <div styleName="table-text-content">
              <h2>Pending Invites</h2>
            </div>
            {invitedUsers.length ? (
              <Table>
                {invitedUsers.map(e => (
                  <TableRow key={e}>
                    <TableCell>{e}</TableCell>
                  </TableRow>
                ))}
              </Table>
            ) : (
              <p>There are no invites pending.</p>
            )}
          </div>
        </>
      ) : null}
    </>
  );
}

function InviteForm({ organisationAdmin, onSendInvite }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = () => {
    setLoading(true);
    onSendInvite(email);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setEmail('');
      setTimeout(() => {
        setSent(false);
      }, 500);
    }, 300);
  };

  if (!organisationAdmin) return null;

  return (
    <div styleName="organisation-section">
      <h2>Invite Users</h2>
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
            value={email}
            name="name"
            onChange={e => {
              setEmail(e.currentTarget.value);
            }}
          />
        </FormGroup>
        <Button
          basic
          compact
          stretch
          loading={loading}
          disabled={loading}
          type="submit"
          as="button"
        >
          Send Invite
        </Button>
        {sent ? <FormNotification success>Sent!</FormNotification> : null}
      </form>
    </div>
  );
}

export default () => {
  return (
    <ProfileLayout pageName="Organisation">
      <ErrorBoundary>
        <Organisation />
      </ErrorBoundary>
    </ProfileLayout>
  );
};

function fetchOrganisation(id) {
  return request(`/api/organisation/${id}`, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

function fetchStats(id) {
  return request(`/api/organisation/stats/${id}`, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

function sendInvite(id, email) {
  return request(`/api/organisation/${id}`, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ email })
  });
}

function toggleOrganisationType(allowAnyUserWithCompanyEmail) {
  return request('/api/organisation', {
    method: 'PATCH',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      op: 'update',
      value: {
        allowAnyUserWithCompanyEmail
      }
    })
  });
}
