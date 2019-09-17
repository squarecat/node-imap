import './organisation.module.scss';

import React, { useCallback, useContext, useMemo, useState } from 'react';
import { TextImportant, TextLink } from '../../../../components/text';

import { AlertContext } from '../../../../providers/alert-provider';
import BillingHistory from '../../../../app/profile/team/billing-history';
import Button from '../../../../components/btn';
import CardDetails from '../../../../components/card-details';
import CurrentUsers from '../../../../app/profile/team/current-users';
import { EditIcon } from '../../../../components/icons';
import ErrorBoundary from '../../../../components/error-boundary';
import { FormCheckbox } from '../../../../components/form';
import { ModalContext } from '../../../../providers/modal-provider';
import OrganisationBillingModal from '../../../../components/modal/organisation-billing';
import PendingInvites from '../../../../app/profile/team/invited-users';
import ProfileLayout from '../../../../app/profile/layout';
import TeamInvite from '../../../../components/form/team-invite';
import WarningModal from '../../../../components/modal/warning-modal';
import cx from 'classnames';
import formatDate from 'date-fns/format';
import { openChat } from '../../../../utils/chat';
import request from '../../../../utils/request';
import useAsync from 'react-use/lib/useAsync';
import useUser from '../../../../utils/hooks/use-user';

export default () => {
  return (
    <ProfileLayout pageName="Team">
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

  const content = useMemo(() => {
    if (loading) return <span>Loading...</span>;
    if (!organisationId || !organisation) {
      return (
        <div styleName="organisation-section">
          <span>You are not part of a team.</span>
        </div>
      );
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
          <div styleName="organisation-section">
            <h2>Invite Users</h2>
            <TeamInvite organisation={organisation} />
          </div>
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
  }, [loading, organisation, organisationAdmin, organisationId]);
  return content;
}

const OrganisationStatus = React.memo(({ active, admin, billing = {} }) => {
  if (active) {
    return (
      <p>
        Your account is <TextImportant>active</TextImportant>.{' '}
        {admin ? 'Team members' : 'You'} can start unsubscribing!
      </p>
    );
  }

  if (!admin) {
    return (
      <>
        <p>
          You <TextImportant>cannot unsubscribe</TextImportant> while the team
          is inactive.
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
      {state.allowAnyUserWithCompanyEmail && organisation.domain ? (
        <>
          <p>
            Anyone with the <TextImportant>{organisation.domain}</TextImportant>{' '}
            domain can automatically join your team. This means they can sign-in
            and connect accounts with a {organisation.domain} email address.
          </p>
          <p>
            You can invite anyone without your domain to join by using the form
            below.
          </p>
        </>
      ) : (
        <p>
          Only people you invite with the form below can join your team. This
          means{' '}
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
            Allow anyone with an email address at the{' '}
            <TextImportant>{organisation.domain}</TextImportant> domain to
            automatically join your team
          </span>
        }
      />
      {state.toggling ? <span styleName="saving">Saving...</span> : null}

      <p styleName="footnote">
        Only connected email provider accounts are counted as billed seats. When
        someone signs-in with or connects a Google, Microsoft, iCloud or any
        other email account your plan will be updated and prorated.
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

  const onClickAddBilling = useCallback(() => {
    const addPaymentMethodSuccess = () => {
      setOrganisationLastUpdated(Date.now());
    };
    openModal(
      <OrganisationBillingModal
        organisation={organisation}
        onSuccess={addPaymentMethodSuccess}
      />
    );
  }, [openModal, organisation, setOrganisationLastUpdated]);

  let subscriptionStatusText;
  if (subscriptionStatus === 'incomplete') {
    subscriptionStatusText = (
      <p>
        Your subscription is not active. You need to complete additional card
        authentication. If you have not received instructions on how to do this
        please send us a message and we will help.
      </p>
    );
  } else if (subscriptionStatus === 'canceled') {
    subscriptionStatusText = (
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
        {active && !card ? <p>Your team has been activated for free!</p> : null}
        {subscriptionStatusText}

        {card ? (
          <div styleName="card-details">
            <CardDetails card={billing.card} />
            <a styleName="card-details-edit" onClick={onClickAddBilling}>
              <EditIcon />
            </a>
          </div>
        ) : null}

        {subscriptionId ? (
          <BillingInformation organisationId={id} currentUsers={currentUsers} />
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
          <p>
            <TextLink onClick={() => openChat()}>Send us a message</TextLink> to
            add or modify your VAT number.
          </p>
        </div>
      ) : null}
    </>
  );
}

function BillingInformation({ organisationId, currentUsers }) {
  const { open: openModal } = useContext(ModalContext);

  const { value: subscription = {}, loading } = useAsync(
    () => fetchSubscription(organisationId),
    [organisationId, currentUsers]
  );

  const dateFormat = 'Do MMMM YYYY';

  const onClickCancel = useCallback(
    ({ periodEnd }) => {
      // const onCancel = async () => {
      //   try {
      //     await cancelSubscription(organisationId);
      //     alertActions.setAlert({
      //       level: 'success',
      //       message: `Successfully cancelled subscription - it will end on ${periodEnd}`,
      //       isDismissable: true,
      //       autoDismiss: false
      //     });
      //   } catch (err) {
      //     console.error(err);
      //     // toggleLoading(false);
      //     // alertActions.setAlert({
      //     //   level: 'error',
      //     //   message: `Something went wrong cancelling your subscription, try again or contact support.`,
      //     //   isDismissable: true,
      //     //   autoDismiss: false
      //     // });
      //   }
      // };
      openModal(
        <WarningModal
          onConfirm={() => openChat()}
          content={
            <>
              <p>
                <TextImportant>
                  We can't automate this yet, please contact us to cancel your
                  subscription.
                </TextImportant>
              </p>
              <p>
                Your subscription will be cancelled immediately. Your account
                will be deactivated at the end of this billing period on{' '}
                {periodEnd}.
              </p>
            </>
          }
          confirmText="Contact Us"
        />,
        {
          dismissable: true
        }
      );
    },
    [openModal]
  );

  const content = useMemo(() => {
    if (loading) return <span>Loading...</span>;

    const {
      canceled_at,
      current_period_end,
      ended_at,
      quantity,
      plan = {},
      upcomingInvoiceAmount,
      coupon
    } = subscription;

    const periodEnd = formatDate(current_period_end * 1000, dateFormat);

    const discountText = getDiscountText(coupon);

    if (canceled_at) {
      return (
        <>
          <p>Cancelled on: {formatDate(canceled_at * 1000, dateFormat)}</p>
          {ended_at ? (
            <p>Ended on: {formatDate(ended_at * 1000, dateFormat)}</p>
          ) : (
            <p>Ends on: {formatDate(current_period_end * 1000, dateFormat)}</p>
          )}
        </>
      );
    } else {
      return (
        <>
          <p>
            You are signed up for the <TextImportant>Teams plan</TextImportant>{' '}
            billed at{' '}
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
          {discountText ? (
            <p>
              Your discount of <TextImportant>{discountText}</TextImportant> is
              applied!
            </p>
          ) : null}
          <p>
            You'll next be billed{' '}
            <TextImportant>
              ${(upcomingInvoiceAmount / 100).toFixed(2)}
            </TextImportant>{' '}
            on the <TextImportant>{periodEnd}</TextImportant>.
          </p>
          <Button
            basic
            compact
            stretch
            onClick={() => onClickCancel({ periodEnd })}
          >
            Cancel Subscription
          </Button>
        </>
      );
    }
  }, [loading, subscription]);

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

function getDiscountText(coupon) {
  if (!coupon) return null;

  const {
    valid,
    duration,
    amount_off,
    percent_off,
    duration_in_months
  } = coupon;

  if (!valid || (!amount_off && !percent_off)) return null;

  let amountText;
  if (percent_off) {
    amountText = `${percent_off}% off`;
  } else if (amount_off) {
    amountText = `$${(amount_off / 100).toFixed(2)} off`;
  }
  if (duration === 'forever') {
    return amountText;
  }
  if (duration === 'once') {
    return `${amountText} for 1 month`;
  }
  return `${amountText} for ${duration_in_months} months`;
}
