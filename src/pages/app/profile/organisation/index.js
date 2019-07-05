import './organisation.module.scss';

import React, { useCallback, useContext, useMemo, useState } from 'react';

import { AlertContext } from '../../../../providers/alert-provider';
import BillingHistory from '../../../../app/profile/organisation/billing-history';
import Button from '../../../../components/btn';
import CardDetails from '../../../../components/card-details';
import CurrentUsers from '../../../../app/profile/organisation/current-users';
import ErrorBoundary from '../../../../components/error-boundary';
import { FormCheckbox } from '../../../../components/form';
import InviteForm from '../../../../app/profile/organisation/invite';
import { ModalContext } from '../../../../providers/modal-provider';
import OrganisationBillingModal from '../../../../components/modal/organisation-billing';
import PendingInvites from '../../../../app/profile/organisation/invited-users';
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
      organisationLastUpdated: u.organisationLastUpdated || 0
    };
  });

  const { value: organisation, loading } = useAsync(
    () => fetchOrganisation(organisationId),
    [organisationId, organisationLastUpdated]
  );

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
            <OrganisationStatus
              admin={organisationAdmin}
              active={active}
              billing={billing}
            />
          </div>

          {organisationAdmin ? <Billing organisation={organisation} /> : null}

          <CurrentUsers
            organisationId={organisationId}
            adminUserEmail={adminUserEmail}
            organisationAdmin={organisationAdmin}
          />

          {organisationAdmin ? (
            <Settings loading={loading} organisation={organisation} />
          ) : null}

          {organisationAdmin ? (
            <InviteForm organisation={organisation} />
          ) : null}

          {organisationAdmin ? (
            <PendingInvites
              organisationId={organisationId}
              invitedUsers={invitedUsers}
            />
          ) : null}

          {organisationAdmin ? (
            <BillingHistory organisationId={organisationId} />
          ) : null}
        </>
      );
    },
    [loading, organisation, organisationAdmin, organisationId]
  );
  return content;
}

const OrganisationStatus = React.memo(({ active, admin, billing = {} }) => {
  if (active) {
    return (
      <p>
        Your account is <TextImportant>active</TextImportant>.{' '}
        {admin ? 'Organisation members' : 'You can'} can start unsubscribing!
      </p>
    );
  }

  if (!admin) {
    return (
      <>
        <p>
          You <TextImportant>cannot unsubscribe</TextImportant> while the
          organisation is inactive.
        </p>
        <p>Please contact your administrator.</p>
      </>
    );
  }

  let reason;
  if (!billing.card) {
    reason = 'you have not added a payment method';
  } else if (billing.subscriptionStatus === 'canceled') {
    reason = 'you have canceled your subscription';
  }
  return (
    <>
      <p>
        Your account is <TextImportant>inactive</TextImportant> because {reason}
        .
      </p>
      <p>
        Members <TextImportant>cannot unsubscribe</TextImportant> while your
        account is inactive.
      </p>
    </>
  );
});

const Settings = React.memo(({ loading, organisation }) => {
  const { actions: alertActions } = useContext(AlertContext);
  const [state, setState] = useState({
    allowAnyUserWithCompanyEmail: organisation.allowAnyUserWithCompanyEmail,
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
          allowAnyUserWithCompanyEmail: toggled,
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
          allowAnyUserWithCompanyEmail:
            organisation.allowAnyUserWithCompanyEmail,
          toggling: false
        });
      }, 300);
    }
  };

  if (loading) return null;

  return (
    <div styleName="organisation-section">
      <h2>Invite Settings</h2>
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
      {state.toggling ? <span styleName="saving">Saving...</span> : null}

      <p styleName="footnote">
        Only connected email provider accounts are counted as billed seats. When
        someone logs in with or connects a Google/Microsoft account your plan
        will be updated and prorated.
      </p>
    </div>
  );
});

function Billing({ organisation }) {
  const { open: openModal } = useContext(ModalContext);

  const [isBeta, { setOrganisationLastUpdated }] = useUser(u => u.isBeta);

  const { id, active, billing = {}, currentUsers } = organisation;
  const {
    card,
    vatNumber,
    subscriptionId,
    subscriptionStatus,
    delinquent
  } = billing;

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
        setOrganisationLastUpdated(Date.now());
      };
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

        {isBeta ? <p>All usage is free during the beta!</p> : null}

        {subscriptionId ? (
          <BillingInformation organisationId={id} currentUsers={currentUsers} />
        ) : null}

        {infoText}

        {card ? (
          <div style={{ marginTop: 20 }}>
            <CardDetails card={billing.card} padded />
            <Button basic compact stretch onClick={onClickAddBilling}>
              Change Payment Method
            </Button>
          </div>
        ) : null}

        {!card && !active ? (
          <>
            <p>No payment method stored.</p>
            <p>
              You need to add a payment method to activate your organisation.
            </p>
            <Button basic compact stretch onClick={onClickAddBilling}>
              Add Payment Method
            </Button>
          </>
        ) : null}
      </div>

      {card ? (
        <div styleName="organisation-section">
          <h2>Invoicing Details</h2>
          <p>VAT Number: {vatNumber || '-'}</p>

          <p>Contact us to add or modify your VAT number.</p>
        </div>
      ) : null}
    </>
  );
}

function BillingInformation({ organisationId, currentUsers }) {
  const { value: subscription = {}, loading } = useAsync(
    () => fetchSubscription(organisationId),
    [organisationId, currentUsers]
  );

  const dateFormat = 'Do MMMM YYYY';

  const content = useMemo(
    () => {
      if (loading) return <span>Loading...</span>;

      const {
        canceled_at,
        current_period_end,
        ended_at,
        quantity,
        plan = {},
        upcomingInvoice
      } = subscription;

      if (canceled_at) {
        return (
          <>
            <p>Cancelled on: {formatDate(canceled_at * 1000, dateFormat)}</p>
            {ended_at ? (
              <p>Ended on: {formatDate(ended_at * 1000, dateFormat)}</p>
            ) : (
              <p>
                Ends on: {formatDate(current_period_end * 1000, dateFormat)}
              </p>
            )}
            <p>
              Subscription ends:{' '}
              {formatDate(current_period_end * 1000, dateFormat)}
            </p>
          </>
        );
      } else {
        return (
          <>
            <p>
              You are signed up for the{' '}
              <TextImportant>Enterprise plan</TextImportant> billed at{' '}
              <TextImportant>
                ${(plan.amount / 100).toFixed(2)} per seat
              </TextImportant>
              .
            </p>
            <p>
              You are currently using{' '}
              <TextImportant>
                {`${quantity} seat${quantity === 1 ? '' : 's'}`}
              </TextImportant>
              .
            </p>
            <p>
              You'll next be billed ${(upcomingInvoice.total / 100).toFixed(2)}{' '}
              on the{' '}
              <TextImportant>
                {formatDate(current_period_end * 1000, dateFormat)}
              </TextImportant>
              .
            </p>
          </>
        );
      }
    },
    [loading, subscription]
  );

  return <div>{content}</div>;
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
