import './organisation.module.scss';

import {
  FormCheckbox,
  FormGroup,
  FormInput,
  FormNotification
} from '../../../../components/form';
import React, {  useState } from 'react';
import Table, { TableCell, TableRow } from '../../../../components/table';

import Button from '../../../../components/btn';
import CardDetails from '../../../../components/card-details';
import { Elements } from 'react-stripe-elements';
import ErrorBoundary from '../../../../components/error-boundary';
import OrganisationBillingModal from '../../../../components/modal/organisation-billing';
import ProfileLayout from '../layout';
import { TextImportant } from '../../../../components/text';
import cx from 'classnames';
import relative from 'tiny-relative-date';
import request from '../../../../utils/request';
import { useAsync } from '../../../../utils/hooks';
import useUser from '../../../../utils/hooks/use-user';

function Organisation() {
  const [{ organisationId, organisationAdmin }] = useUser(u => {
    return {
      organisationId: u.organisationId,
      organisationAdmin: u.organisationAdmin
    };
  });

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
    domain,
    billing
  } = organisation;

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
            members can start unsubscribing!
          </p>
        ) : (
          <p>
            Your account is <TextImportant>inactive</TextImportant> because you
            have disabled it or you have not added a payment method.
          </p>
        )}
        <p>
          {currentUsers.length} seats used (billed at $4 per seat per month)
        </p>
        <p>{invitedUsers.length} invites pending</p>
      </div>

      <Billing
        organisationAdmin={organisationAdmin}
        billing={billing}
        onUpdateCard={() => {}}
        onRemoveCard={() => {}}
      />

      <Settings loading={loading} organisation={organisation} />

      {organisationAdmin ? (
        <InviteForm organisationId={organisation.id}/>
      ) : null}

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

function Settings({ loading, organisation }) {
  const [state, setState] = useState({
    toggling: false,
    error: false,
    allowAnyUserWithCompanyEmail: organisation.allowAnyUserWithCompanyEmail
  });

  const onToggleSetting = async () => {
    try {
      setState({
        ...state,
        toggling: true,
        allowAnyUserWithCompanyEmail: !state.allowAnyUserWithCompanyEmail
      });

      await toggleOrganisationType(
        organisation.id,
        !state.allowAnyUserWithCompanyEmail
      );
      setTimeout(() => {
        setState({ ...state, toggling: false, error: false });
      }, 300);
    } catch (err) {
      // revert if error
      setTimeout(() => {
        setState({
          ...state,
          allowAnyUserWithCompanyEmail: state.allowAnyUserWithCompanyEmail,
          toggling: false,
          error: true
        });
      }, 300);
    }
  };

  if (loading) return null;

  return (
    <div styleName="organisation-section">
      <h2>Settings</h2>
      {state.allowAnyUserWithCompanyEmail ? (
        <>
          <p>
            Any user with the{' '}
            <TextImportant>{organisation.domain}</TextImportant> domain can
            join. This means they can sign-in and connect accounts with a{' '}
            {organisation.domain} email address.
          </p>
          <p>
            You can also invite users outside of your organisation using the
            form below.
          </p>
        </>
      ) : (
        <p>
          Only users you invite with the form below can join. This means{' '}
          <TextImportant>only email addresses on the invite list</TextImportant>{' '}
          can sign-in and be connected.
        </p>
      )}
      <FormCheckbox
        disabled={state.toggling}
        onChange={() => onToggleSetting()}
        checked={state.allowAnyUserWithCompanyEmail}
        label={`Allow any user with the ${organisation.domain} domain to join`}
      />
      {state.toggling ? <span>Saving...</span> : null}
      {state.error ? (
        <FormNotification error>
          Something went wrong, your settings have not been saved.
        </FormNotification>
      ) : null}
    </div>
  );
}

function Billing({
  organisationAdmin,
  billing = {},
  onUpdateCard,
  onRemoveCard
}) {
  const [showBillingModal, toggleBillingModal] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!organisationAdmin) return null;

  const { card, company } = billing;

  return (
    <>
      <div styleName="organisation-section">
        <h2>Billing Details</h2>
        {card ? (
          <>
            <CardDetails card={billing.card} />
            <Button
              basic
              compact
              stretch
              disabled={loading}
              loading={loading}
              onClick={() => onUpdateCard()}
            >
              Update Card
            </Button>
            <Button
              basic
              compact
              stretch
              disabled={loading}
              loading={loading}
              onClick={() => onRemoveCard()}
            >
              Remove Card
            </Button>
          </>
        ) : (
          <>
            <p>No payment method stored.</p>
            <p>
              You need to add a payment method to activate your organisation.
            </p>
            <Button
              basic
              compact
              stretch
              disabled={loading}
              loading={loading}
              onClick={() => toggleBillingModal(true)}
            >
              Add Payment Method
            </Button>
          </>
        )}
        {company ? (
          <>
            <h2>Company Details</h2>
            <p>Name: {company.name}</p>
            <p>VAT Number: {company.vatNumber}</p>
          </>
        ) : null}
      </div>
      <Elements>
        <OrganisationBillingModal
          shown={showBillingModal}
          onClose={() => toggleBillingModal(false)}
        />
      </Elements>
    </>
  );
}

function InviteForm({ organisationId }) {
  const [state, setState] = useState({
    email: '',
    loading: false,
    error: false,
    sent: false
  });

  const onSubmit = async () => {
    try {
      setState({
        ...state,
        loading: true,
        error: false,
        sent: false
      });

      await sendInvite(organisationId, state.email);
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

function toggleOrganisationType(id, allowAnyUserWithCompanyEmail) {
  return request(`/api/organisation/${id}`, {
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
