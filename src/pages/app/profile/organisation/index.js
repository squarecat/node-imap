import './organisation.module.scss';

import React, { useCallback, useContext, useMemo, useState } from 'react';
import Table, { TableCell, TableRow } from '../../../../components/table';

import { AlertContext } from '../../../../providers/alert-provider';
import Button from '../../../../components/btn';
import CardDetails from '../../../../components/card-details';
import CurrentUsers from '../../../../app/profile/organisation/users';
import ErrorBoundary from '../../../../components/error-boundary';
import { FormCheckbox } from '../../../../components/form';
import InviteForm from '../../../../app/profile/organisation/invite';
import { ModalContext } from '../../../../providers/modal-provider';
import OrganisationBillingModal from '../../../../components/modal/organisation-billing';
import ProfileLayout from '../../../../app/profile/layout';
import { TextImportant } from '../../../../components/text';
import cx from 'classnames';
import formatDate from 'date-fns/format';
import request from '../../../../utils/request';
import useAsync from 'react-use/lib/useAsync';
import useUser from '../../../../utils/hooks/use-user';

export default () => {
  return (
    <ProfileLayout pageName="Organisation">
      <ErrorBoundary>
        <Organisation />
      </ErrorBoundary>
    </ProfileLayout>
  );
};

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

  const { value: organisation, loading } = useAsync(fetchOrganisation, [
    organisationId,
    organisationLastUpdated
  ]);

  const content = useMemo(
    () => {
      if (loading) return <span>Loading...</span>;
      if (!organisation) {
        return <span>You are not part of an organisation.</span>;
      }

      const {
        name,
        active,
        adminUserEmail,
        invitedUsers = [],
        billing
      } = organisation;

      const isInvitingEnabled = organisationAdmin && active;
      return (
        <>
          <div styleName="organisation-section">
            <h2>{name}</h2>
            <p>
              <span
                styleName={cx('org-status', {
                  active,
                  inactive: !active
                })}
              >
                {active ? 'Active' : 'Inactive'}
              </span>
              {organisationAdmin ? (
                <span
                  styleName={cx('org-status', {
                    active: true
                  })}
                >
                  Admin
                </span>
              ) : null}
            </p>
            <OrganisationStatus active={active} billing={billing} />
          </div>

          {organisationAdmin ? <Billing organisation={organisation} /> : null}

          <Settings loading={loading} organisation={organisation} />

          {isInvitingEnabled ? (
            <InviteForm organisation={organisation} />
          ) : null}

          <CurrentUsers
            organisationId={organisationId}
            adminUserEmail={adminUserEmail}
          />

          {isInvitingEnabled ? (
            <div styleName="organisation-section tabled">
              <div styleName="table-text-content">
                <h2>Pending Invites</h2>
              </div>
              {invitedUsers.length ? (
                <Table>
                  <tbody>
                    {invitedUsers.map(email => (
                      <TableRow key={email}>
                        <TableCell>{email}</TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>There are no invites pending.</p>
              )}
            </div>
          ) : null}
        </>
      );
    },
    [loading, organisation, organisationAdmin, organisationId]
  );
  return content;
}

const OrganisationStatus = React.memo(({ active }) => {
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
        not added a payment method or you have deactivated your organisation.
      </p>
      <p>
        You cannot invite new members, and existing members cannot unsubscribe
        while your account is inactive.
      </p>
    </>
  );
});

const Settings = React.memo(({ loading, organisation }) => {
  const { actions: alertActions } = useContext(AlertContext);
  const [state, setState] = useState({
    setting: organisation.allowAnyUserWithCompanyEmail,
    toggling: false
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
          setting: toggled,
          toggling: false
        });
      }, 300);
    } catch (err) {
      alertActions.setAlert({
        id: 'toggle-org-setting-error',
        level: 'error',
        message: `Error saving your settings. Please try again or send us a message.`,
        isDismissable: true,
        autoDismiss: true
      });
      // revert if error
      setTimeout(() => {
        setState({
          setting: organisation.allowAnyUserWithCompanyEmail,
          toggling: false
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
    </div>
  );
});

function Billing({ organisation }) {
  const { open: openModal } = useContext(ModalContext);

  const [, { setOrganisationLastUpdated }] = useUser();

  const { id, active, billing = {}, currentUsers } = organisation;
  const {
    card,
    company = {},
    subscriptionId,
    subscriptionStatus,
    delinquent
  } = billing;

  const seats = currentUsers.length;

  // const onClickRemoveCard = useCallback(
  //   () => {
  //     const removeCard = () => {
  //       console.log('not yet implemented');
  //     };
  //     openModal(
  //       <WarningModal
  //         onConfirm={() => removeCard()}
  //         content={
  //           <p>
  //             If you remove your payment method and do not add one by the end of
  //             your billing period{' '}
  //             <TextImportant>
  //               we will deactivate your organisation
  //             </TextImportant>
  //             . You have until the end of this billing period to add a new
  //             payment method.
  //           </p>
  //         }
  //         confirmText="Confirm"
  //       />,
  //       {
  //         dismissable: true
  //       }
  //     );
  //   },
  //   [openModal]
  // );

  const onClickAddBilling = useCallback(
    () => {
      const addPaymentMethodSuccess = () => {
        console.log('success adding organisation payment method!');
        setOrganisationLastUpdated(Date.now());
      };
      console.log('opening modal');
      openModal(
        <OrganisationBillingModal
          organisation={organisation}
          onSuccess={addPaymentMethodSuccess}
        />
      );
    },
    [openModal, organisation, setOrganisationLastUpdated]
  );

  let infoText;
  if (subscriptionStatus === 'incomplete') {
    infoText = (
      <p>
        Your subscription is not active. You need to complete additional card
        authentication. If you have not received instructions on how to do this
        please send us a message and we will help.
      </p>
    );
  } else if (subscriptionStatus === 'canceled') {
    infoText = (
      <p>
        Your subscription has been canceled{' '}
        {delinquent ? 'as we failed to collect payment' : null}. Update your
        payment method or contact us to re-activate it.
      </p>
    );
  }

  return (
    <>
      <div styleName="organisation-section">
        <h2>Billing Details</h2>
        {subscriptionId ? <BillingInformation organisationId={id} /> : null}

        {infoText}

        {card ? (
          <>
            <CardDetails card={billing.card} padded />
            <Button basic compact stretch onClick={onClickAddBilling}>
              Change Payment Method
            </Button>
          </>
        ) : null}

        {!card && !active ? (
          <>
            <p>No payment method stored.</p>
            <p>
              You need to add a payment method to activate your organisation.
            </p>
            <p>
              You currently have{' '}
              <TextImportant>
                {`${seats} member${seats > 1 ? 's' : ''}`}
              </TextImportant>
              .
            </p>
            <Button basic compact stretch onClick={onClickAddBilling}>
              Add Payment Method
            </Button>
          </>
        ) : null}
      </div>
      <div styleName="organisation-section">
        <h2>Company Details</h2>
        {company.vatNumber ? (
          <>
            <p>Name: {company.name || '-'}</p>
            <p>VAT Number: {company.vatNumber || '-'}</p>
            <Button
              basic
              compact
              stretch
              disabled={true} // not available yet
              onClick={() => {}}
            >
              Update (coming soon)
            </Button>
          </>
        ) : null}
        <p>Contact us to add or modify your VAT number and company details.</p>
      </div>
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
    current_period_end,
    ended_at,
    quantity,
    plan = {}
  } = subscription;

  const dateFormat = 'Do MMMM YYYY';

  return (
    <div>
      <p>
        You'll next be billed on the{' '}
        <TextImportant>
          {formatDate(current_period_end * 1000, dateFormat)}
        </TextImportant>
        .
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

      <p>
        You are signed up for the <TextImportant>Enterprise plan</TextImportant>{' '}
        billed at <TextImportant>${plan.amount / 100} per seat</TextImportant>.
      </p>
      <p>
        You are currently using{' '}
        <TextImportant>
          {`${quantity} seat${quantity > 1 ? 's' : ''}`}
        </TextImportant>
        .
      </p>
      <p>
        Change to the number of members will be pro-rated until the end of the
        billing period. This means you will only be charged for the remaining
        time in the month for new members, and will receive credit for removed
        members.
      </p>
    </div>
  );
}

function fetchOrganisation(id) {
  return request(`/api/organisation/${id}`, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
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
