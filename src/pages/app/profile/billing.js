import './billing.module.scss';

import { ENTERPRISE, PACKAGES, getPackage } from '../../../../shared/prices';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import Table, { TableCell, TableRow } from '../../../components/table';
import { TextFootnote, TextImportant } from '../../../components/text';

import { AlertContext } from '../../../providers/alert-provider';
import BillingModal from '../../../components/modal/billing';
import Button from '../../../components/btn';
import CardDetails from '../../../components/card-details';
import { DatabaseContext } from '../../../providers/db-provider';
import ErrorBoundary from '../../../components/error-boundary';
import { ModalContext } from '../../../providers/modal-provider';
import PlanImage from '../../../components/pricing/plan-image';
import Price from '../../../components/pricing/price';
import ProfileLayout from '../../../app/profile/layout';
import WarningModal from '../../../components/modal/warning-modal';
import cx from 'classnames';
import format from 'date-fns/format';
import { navigate } from 'gatsby';
// import { openChat } from '../../../utils/chat';
import request from '../../../utils/request';
import useAsync from 'react-use/lib/useAsync';
import useUser from '../../../utils/hooks/use-user';

export default function() {
  return (
    <ProfileLayout pageName="Billing">
      <Billing />
    </ProfileLayout>
  );
}

function Billing() {
  const { open: openModal } = useContext(ModalContext);

  const [
    { billing = {}, organisationId, organisation },
    { setBilling }
  ] = useUser(u => {
    return {
      billing: u.billing,
      organisationId: u.organisationId,
      organisation: u.organisation
    };
  });

  const { credits = 0, creditsUsed = 0, card } = billing;

  const onClickBuyPackage = useCallback(
    id => {
      const pkg = getPackage(id);
      const onPurchaseSuccess = ({ billing }) => {
        setBilling(billing);
      };
      openModal(
        <BillingModal
          selectedPackage={pkg}
          billingCard={card}
          onPurchaseSuccess={onPurchaseSuccess}
        />
      );
    },
    [openModal, card, setBilling]
  );

  if (organisationId) {
    return (
      <div styleName="billing-section information">
        <h2>Information</h2>
        <p>Your account belongs to the {organisation.name} team.</p>
        <p>
          You have <TextImportant>unlimited</TextImportant> credits.
        </p>
      </div>
    );
  }

  return (
    <>
      <div styleName="billing-section information">
        <h2>Information</h2>
        <p>
          You have <TextImportant>{credits}</TextImportant> credits.
        </p>
        <p>
          You have used a total of <TextImportant>{creditsUsed}</TextImportant>{' '}
          credits.
        </p>
      </div>
      <Packages onClickBuy={onClickBuyPackage} />
      <Enterprise />
      <BillingDetails />
      <BillingHistory />
    </>
  );
}

// function UsageBased() {
//   const { state, dispatch } = useContext(BillingContext);

//   const isUsageActive = state.settings.usageFallback;

//   return (
//     <div styleName="billing-section">
//       <h2>Usage Based</h2>
//       <FormCheckbox
//         onChange={() =>
//           dispatch({
//             type: 'set-setting',
//             data: {
//               key: 'usageFallback',
//               value: !state.settings.usageFallback
//             }
//           })
//         }
//         checked={state.settings.usageFallback}
//         label="Switch to usage based when you run out of unsubscribes"
//       />
//       <div styleName="plans-list">
//         <PlanImage smaller compact type="usage-based" />
//         <h3 styleName="plan-title">Per unsubscribe</h3>
//         <Price price={USAGE_BASED.price} />
//         <Tooltip
//           overlay={
//             <span>
//               {isUsageActive
//                 ? 'Disable using the toggle above'
//                 : 'Enable using the toggle above'}
//             </span>
//           }
//         >
//           <span
//             styleName={cx('payg-status', {
//               active: isUsageActive,
//               inactive: !isUsageActive
//             })}
//           >
//             {isUsageActive ? 'Active' : 'Inactive'}
//           </span>
//         </Tooltip>
//       </div>
//       <TextFootnote>
//         {isUsageActive
//           ? 'When you run out of unsubscribes you will be able to continue unsubscribing which we will charge $0.10 per unsubscribe.'
//           : 'When you run out of unsubscribes you will be unable to unsubscribe from any more emails and you will NOT be charged.'}
//       </TextFootnote>
//     </div>
//   );
// }

function Packages({ onClickBuy }) {
  const db = useContext(DatabaseContext);
  const [{ previousPackageId, card }] = useUser(u => {
    const { billing = {} } = u;
    return {
      previousPackageId: billing.previousPackageId,
      card: billing.card
    };
  });

  const [count, setCount] = useState('-');
  useEffect(() => {
    db.mail
      .where('status')
      .equals('subscribed')
      .count()
      .then(c => {
        setCount(c);
      });
  }, [db]);

  return (
    <div styleName="billing-section" id="packages">
      <h2 styleName="package-title">
        Packages
        <span styleName="credit-info">1 Credit = 1 Unsubscribe</span>
      </h2>

      {PACKAGES.map(p => {
        const isPreviousPackage = previousPackageId === p.id;
        const showReBuy = isPreviousPackage && !!card;
        const discountText = `Save ${p.discount * 100}%`;
        return (
          <div styleName="plans-list" key={p.credits}>
            <PlanImage smaller compact type="package" />
            <h3 styleName="plan-title">{p.credits} credits</h3>
            <Price price={p.price} />
            <div styleName="package-buy-btn">
              <a styleName="billing-btn" onClick={() => onClickBuy(p.id)}>
                {showReBuy ? 'Re-buy' : 'Buy'}
              </a>
              <span styleName="package-discount">{discountText}</span>
            </div>
          </div>
        );
      })}
      <p>
        Psst - Currently your inbox contains approximately{' '}
        <TextImportant>{count} subscription emails</TextImportant> that you
        haven't unsubscribed from yet. Bear that in mind when buying a package!
      </p>
    </div>
  );
}

function Enterprise() {
  const { open: openModal } = useContext(ModalContext);
  const [loading, setLoading] = useState(false);

  const onClickEnableTeam = useCallback(() => {
    async function onConfirm() {
      try {
        setLoading(true);
        await enableTeam();
        setTimeout(() => {
          window.location.href = '/app/profile/team';
        }, 2000);
      } catch (err) {
        setLoading(false);
        console.error('error enabling teams', err);
      }
    }
    openModal(
      <WarningModal
        onConfirm={onConfirm}
        autoClose={false}
        content={
          <>
            <p>
              Leave Me Alone for Teams lets your entire team keep their inbox
              clean so they can focus on building your business.
            </p>
            <p>
              <PlanImage smaller compact type="enterprise" />
            </p>
            <p style={{ textAlign: 'center', fontSize: '16px' }}>
              <TextImportant>Unlimited unsubscribes</TextImportant> for{' '}
              <TextImportant>
                ${(ENTERPRISE.pricePerSeat / 100).toFixed(2)}
              </TextImportant>{' '}
              per seat/month
            </p>
            <p>
              <TextImportant>PLEASE READ:</TextImportant>
              This account will become the admin account for your team. Your
              connected accounts will be removed and you will need to activate
              your team before you can start unsubscribing. Any credits you have
              now will be preserved.
            </p>
            <p>Confirm to set up your new team account.</p>
          </>
        }
        confirmText="Confirm"
        headerText="Get Started with Leave Me Alone for Teams"
        loading={loading}
      />,
      {
        dismissable: true
      }
    );
  }, [loading, openModal]);

  return (
    <div styleName="billing-section">
      <h2>Teams</h2>
      <div styleName="plans-list">
        <PlanImage smaller compact type="enterprise" />
        <div>
          <h3 styleName="plan-title">Unlimited unsubscribes</h3>
        </div>
        <span>
          <Price price={ENTERPRISE.pricePerSeat} asterisk /> per seat
        </span>
        <a styleName="billing-btn" onClick={() => onClickEnableTeam()}>
          Buy Teams
        </a>
      </div>
      <TextFootnote>* billed monthly.</TextFootnote>
    </div>
  );
}

function BillingDetails() {
  const { actions: alertActions } = useContext(AlertContext);
  const [card, { setCard }] = useUser(u => {
    const { billing = {} } = u;
    return billing.card;
  });

  const [loading, setLoading] = useState(false);

  const onClickRemoveCard = useCallback(async () => {
    try {
      setLoading(true);
      await removeUserBillingCard();
      setCard(null);
      alertActions.setAlert({
        id: 'remove-billing-card-success',
        level: 'success',
        message: `Successfully removed stored payment method.`,
        isDismissable: true,
        autoDismiss: true
      });
    } catch (err) {
      alertActions.setAlert({
        id: 'remove-billing-card-error',
        level: 'error',
        message: `Error removing stored payment method. Please try again or send us a message.`,
        isDismissable: true,
        autoDismiss: true
      });
    } finally {
      setLoading(false);
    }
  }, [alertActions, setCard]);

  return (
    <div styleName="billing-section">
      <h2>Billing Details</h2>
      {card ? (
        <>
          <CardDetails card={card} padded />
          <Button
            basic
            compact
            stretch
            disabled={loading}
            loading={loading}
            onClick={() => onClickRemoveCard()}
          >
            Remove Card
          </Button>
          {/* <FormCheckbox
            onChange={() => onClickUpdateAutoBuy()}
            checked={autoBuy}
            label="Auto buy your previous package when you run out of credits"
          /> */}
        </>
      ) : (
        <>
          <p>No payment method stored.</p>
        </>
      )}
    </div>
  );
}

function BillingHistory() {
  const [credits] = useUser(u => {
    return u.billing.credits;
  });
  const { value, loading, error } = useAsync(fetchBillingHistory, [credits]);

  const content = useMemo(() => {
    const history = loading || error ? {} : value;
    const { payments = [], has_more = false } = history;
    let text;
    if (loading) {
      text = <span>Loading...</span>;
    } else if (!payments.length) {
      text = <p>No payments yet.</p>;
    } else {
      text = (
        <p>
          Showing{' '}
          <TextImportant>
            {`${payments.length} previous payment${
              payments.length === 1 ? '' : 's'
            }`}
          </TextImportant>
          .
        </p>
      );
    }

    return (
      <>
        <div styleName="content">
          <h2>Payment history</h2>
          {text}
        </div>
        <ErrorBoundary>
          <Table>
            <tbody>
              {payments.map(invoice => {
                return (
                  <TableRow key={invoice.date}>
                    <TableCell>{getDate(invoice)}</TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell>
                      <>
                        {getPrice(invoice)} {getStatus(invoice)}
                      </>
                    </TableCell>
                    {/* <TableCell>{}</TableCell> */}
                    <TableCell>
                      {invoice.invoice_pdf ? (
                        <a
                          styleName="invoice-btn"
                          href={invoice.invoice_pdf}
                          target="_"
                        >
                          Download
                        </a>
                      ) : null}
                      {invoice.receipt_url ? (
                        <a
                          styleName="invoice-btn"
                          href={invoice.receipt_url}
                          target="_"
                        >
                          Receipt
                        </a>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        </ErrorBoundary>

        {has_more ? <p>For older invoices please contact support.</p> : null}
      </>
    );
  }, [error, loading, value]);

  return <div styleName="billing-section history">{content}</div>;
}

async function fetchBillingHistory() {
  return request('/api/me/billing', {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

function removeUserBillingCard() {
  return request('/api/me/billing', {
    method: 'PATCH',
    body: JSON.stringify({ op: 'remove-card' })
  });
}

function enableTeam() {
  return request('/api/me', {
    method: 'PATCH',
    body: JSON.stringify({ op: 'enable-team' })
  });
}

function getDate({ date }) {
  return format(date * 1000, 'DD/MM/YYYY HH:mm');
}

function getPrice({ price, refunded }) {
  const display = (price / 100).toFixed(2);
  const classes = cx('invoice-price', {
    'invoice-price--refunded': refunded
  });
  return <span styleName={classes}>${display}</span>;
}

function getStatus({ attempted, paid, refunded }) {
  if (refunded) {
    return <span styleName="invoice-status invoice--refunded">Refunded</span>;
  }
  if (!attempted) {
    return <span styleName="invoice-status invoice--pending">Recieved</span>;
  }
  if (!paid) {
    return <span styleName="invoice-status invoice--failed">Failed</span>;
  }
  return <span styleName="invoice-status invoice--paid">Paid</span>;
}
