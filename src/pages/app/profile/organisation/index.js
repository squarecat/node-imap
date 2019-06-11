import './organisation.module.scss';

import {
  FormCheckbox,
  FormGroup,
  FormInput,
  FormNotification
} from '../../../../components/form';
import React, { useReducer, useState } from 'react';
import Table, { TableCell, TableRow } from '../../../../components/table';

import Button from '../../../../components/btn';
import CardDetails from '../../../../components/card-details';
import { Elements } from 'react-stripe-elements';
import ErrorBoundary from '../../../../components/error-boundary';
import OrganisationBillingModal from '../../../../components/modal/organisation-billing';
import ProfileLayout from '../layout';
import { TextImportant } from '../../../../components/text';
import WarningModal from '../../../../components/modal/warning-modal';
import cx from 'classnames';
import formatDate from 'date-fns/format';
import relative from 'tiny-relative-date';
import request from '../../../../utils/request';
import { useAsync } from '../../../../utils/hooks';
import useUser from '../../../../utils/hooks/use-user';

function Organisation() {
  const [
    { organisationId, organisationAdmin, organisationLastUpdated }
  ] = useUser(u => {
    return {
      organisationId: u.organisationId,
      organisationAdmin: u.organisationAdmin,
      organisationLastUpdated: u.organisationLastUpdated
    };
  });

  const { value: organisation = {}, loading } = useAsync(fetchOrganisation, [
    organisationId,
    organisationLastUpdated
  ]);

  const {
    name,
    active,
    currentUsers = [],
    invitedUsers = [],
    billing
  } = organisation;

  if (loading) return <span>Loading...</span>;

  const isInvitingEnabled = organisationAdmin && active;

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
              active,
              inactive: !active
            })}
          >
            {active ? 'Active' : 'Inactive'}
          </span>{' '}
        </p>
        <OrganisationStatus active={active} billing={billing} />
        <p>{currentUsers.length} seats used</p>
        <p>{invitedUsers.length} invites pending</p>
      </div>

      <Billing
        organisationAdmin={organisationAdmin}
        organisation={organisation}
      />

      <Settings loading={loading} organisation={organisation} />

      {isInvitingEnabled ? (
        <InviteForm organisationId={organisationId} />
      ) : null}

      <CurrentUsers organisationId={organisationId} />

      {isInvitingEnabled ? (
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
      ) : null}
    </>
  );
}

function OrganisationStatus({ active, billing }) {
  if (active) {
    return (
      <p>
        Your account is <TextImportant>active</TextImportant>. Organisation
        members can start unsubscribing!
      </p>
    );
  }

  return (
    <>
      <p>
        Your account is <TextImportant>inactive</TextImportant> because you have
        not added a payment method or you have deactivated your account.
      </p>
      <p>
        You cannot invite new members, and existing members cannot unsubscribe
        while your account is inactive.
      </p>
    </>
  );
}

function Settings({ loading, organisation }) {
  const [state, setState] = useState({
    toggling: false,
    error: false,
    allowAnyUserWithCompanyEmail: organisation.allowAnyUserWithCompanyEmail
  });

  const onToggleSetting = async toggled => {
    try {
      setState({
        ...state,
        toggling: true
      });

      await toggleOrganisationType(organisation.id, toggled);

      setTimeout(async () => {
        setState({
          allowAnyUserWithCompanyEmail: toggled,
          toggling: false,
          error: false
        });
        // setState({ ...state, toggling: false, error: false });
      }, 300);
    } catch (err) {
      // revert if error
      setTimeout(() => {
        setState({
          ...state,
          allowAnyUserWithCompanyEmail:
            organisation.allowAnyUserWithCompanyEmail,
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
        onChange={() => onToggleSetting(!state.allowAnyUserWithCompanyEmail)}
        checked={state.allowAnyUserWithCompanyEmail}
        label={
          <span>
            Allow any user with the{' '}
            <TextImportant>{organisation.domain}</TextImportant> domain to join
          </span>
        }
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

function Billing({ organisationAdmin, organisation }) {
  const [showBillingModal, toggleBillingModal] = useState(false);
  const [showWarningModal, toggleWarningModal] = useState(false);

  const [state, setState] = useState({
    loading: false,
    error: false
  });

  const [, { setOrganisationLastUpdated }] = useUser(u => {
    return {
      organisationId: u.organisationId,
      organisationAdmin: u.organisationAdmin,
      organisationLastUpdated: u.organisationLastUpdated
    };
  });

  if (!organisationAdmin) return null;

  const { id, billing = {}, adminUserEmail } = organisation;
  const { card, company = {}, subscriptionId, subscriptionStatus } = billing;

  async function removeCard() {
    // TODO remove the card from the organisation
    // cancel the subscription (and show when it will cancel)
    // webhook for cancelled to update status
    return true;
  }

  async function addPaymentMethodSuccess() {
    toggleBillingModal(false);
    setOrganisationLastUpdated(Date.now());
  }

  return (
    <>
      <div styleName="organisation-section">
        <h2>Billing Details</h2>
        {subscriptionId ? <BillingInformation organisationId={id} /> : null}

        {subscriptionStatus === 'incomplete' ? (
          <p>
            Your subscription is not active. You need to complete additional
            card verification.
          </p>
        ) : null}

        <h3>Card Details</h3>
        {card ? (
          <>
            <CardDetails card={billing.card} />
            <Button
              basic
              compact
              stretch
              disabled={state.loading}
              loading={state.loading}
              onClick={() => toggleWarningModal(true)}
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
              disabled={state.loading}
              loading={state.loading}
              onClick={() => toggleBillingModal(true)}
            >
              Add Payment Method
            </Button>
          </>
        )}
      </div>
      <div styleName="organisation-section">
        <h2>Company Details</h2>
        <p>Name: {company.name || '-'}</p>
        <p>VAT Number: {company.vatNumber || '-'}</p>
        <p>Billing email: {adminUserEmail}</p>
        <p>Contact us to add your VAT number and company details</p>
        <Button
          basic
          compact
          stretch
          disabled={true} // not available yet
          loading={state.loading}
          onClick={() => toggleBillingModal(true)}
        >
          Update (coming soon)
        </Button>
      </div>
      <Elements>
        <OrganisationBillingModal
          organisation={organisation}
          shown={showBillingModal}
          onClose={() => toggleBillingModal(false)}
          onSuccess={organisation => addPaymentMethodSuccess(organisation)}
        />
      </Elements>
      <WarningModal
        shown={showWarningModal}
        onClose={() => toggleWarningModal(false)}
        onConfirm={() => {
          toggleWarningModal(false);
          removeCard();
        }}
        content={
          <p>
            If you remove your payment method and do not add one by the end of
            your billing period{' '}
            <TextImportant>we will deactivate your account</TextImportant>. You
            have until the end of this billing period to add a new payment
            method.
          </p>
        }
        confirmText={'Confirm'}
      />
    </>
  );
}

function BillingInformation({ organisationId }) {
  const { value: subscription = {}, loading } = useAsync(fetchSubscription, [
    organisationId
  ]);

  if (loading) return 'Loading...';

  const {
    canceled_at,
    current_period_start,
    current_period_end,
    ended_at,
    quantity,
    plan = {}
  } = subscription;

  const dateFormat = 'DD MMM YYYY';

  return (
    <div>
      <h3>Details</h3>
      <p>
        Current period:{' '}
        <TextImportant>
          {formatDate(current_period_start * 1000, dateFormat)}
        </TextImportant>{' '}
        to{' '}
        <TextImportant>
          {formatDate(current_period_end * 1000, dateFormat)}
        </TextImportant>
      </p>
      {/* If the subscription has been canceled, the date of that cancellation */}
      {canceled_at ? (
        <>
          <p>Cancelled on: {formatDate(canceled_at * 1000, dateFormat)}</p>
          {ended_at ? (
            <p>Ended on: {formatDate(ended_at * 1000, dateFormat)}</p>
          ) : (
            <p>Ends on: {formatDate(current_period_end * 1000, dateFormat)}</p>
          )}
          <p>
            Subscription ends:{' '}
            {formatDate(current_period_end * 1000, dateFormat)}
          </p>
        </>
      ) : null}

      <h3>Pricing Plan</h3>
      <p>Enterprise: ${plan.amount / 100} per seat</p>
      <p>Seats: {quantity}</p>
    </div>
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

function CurrentUsers({ organisationId }) {
  const { value: stats = [], loadingStats } = useAsync(fetchStats, [
    organisationId
  ]);

  return (
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
              <TableCell>{stat.numberOfUnsubscribes} unsubscribes</TableCell>
              <TableCell>Joined {relative(stat.dateJoined)}</TableCell>
            </TableRow>
          ))}
        </Table>
      )}
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
  return request(`/api/organisation/${id}/stats`, {
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

function fetchSubscription(id) {
  return request(`/api/organisation/${id}/subscription`, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}
