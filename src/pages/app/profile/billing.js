import './billing.module.scss';

import { ENTERPRISE, PACKAGES, getPackage } from '../../../../shared/prices';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import Table, { TableCell, TableRow } from '../../../components/table';
import { TextFootnote, TextImportant } from '../../../components/text';

import BillingModal from '../../../components/modal/billing';
import Button from '../../../components/btn';
import CardDetails from '../../../components/card-details';
import { DatabaseContext } from '../../../providers/db-provider';
import ErrorBoundary from '../../../components/error-boundary';
import { FormNotification } from '../../../components/form';
import { ModalContext } from '../../../providers/modal-provider';
import PlanImage from '../../../components/pricing/plan-image';
import Price from '../../../components/pricing/price';
import ProfileLayout from './layout';
import cx from 'classnames';
import format from 'date-fns/format';
import { openChat } from '../../../utils/chat';
import request from '../../../utils/request';
import { useAsync } from '../../../utils/hooks';
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

  const [{ billing = {}, organisationId }, { setBilling }] = useUser(u => {
    return {
      billing: u.billing,
      organisationId: u.organisationId
    };
  });

  const { credits, creditsUsed = 0, card } = billing;

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
        <p>Your account belongs to an organisation.</p>
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
  useEffect(
    () => {
      db.mail
        .where('status')
        .equals('subscribed')
        .count()
        .then(c => {
          setCount(c);
        });
    },
    [db]
  );

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
  return (
    <div styleName="billing-section">
      <h2>Enterprise</h2>
      <div styleName="plans-list">
        <PlanImage smaller compact type="enterprise" />
        <div>
          <h3 styleName="plan-title">Unlimited credits</h3>
          {/* <span>${ENTERPRISE.pricePerSeat}/seat</span> */}
        </div>
        <span>
          <Price price={ENTERPRISE.pricePerSeat} asterisk /> per seat
        </span>
        <a styleName="billing-btn" onClick={() => openChat()}>
          Contact
        </a>
      </div>
      <TextFootnote>* billed monthly.</TextFootnote>
    </div>
  );
}

function BillingDetails() {
  const [card, { setCard }] = useUser(u => {
    const { billing = {} } = u;
    return billing.card;
  });

  const [state, setState] = useState({ loading: false, error: false });
  // const [autoBuy, setAutoBuy] = useState(initialAutoBuy);

  const onClickRemoveCard = useCallback(
    async () => {
      try {
        setState({
          loading: true,
          error: false
        });
        await removeUserBillingCard();
        setCard(null);
        setState({
          loading: false,
          error: false
        });
      } catch (err) {
        setState({
          loading: false,
          error: true
        });
      }
    },
    [setCard]
  );

  // const onClickUpdateAutoBuy = useCallback(
  //   () => {
  //     const updated = !autoBuy;
  //     setAutoBuy(updated);
  //     updateAutoBuy(updated);
  //   },
  //   [autoBuy]
  // );

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
            disabled={state.loading}
            loading={state.previousPackageIdloading}
            onClick={() => onClickRemoveCard()}
          >
            Remove Card
          </Button>
          {/* <FormCheckbox
            onChange={() => onClickUpdateAutoBuy()}
            checked={autoBuy}
            label="Auto buy your previous package when you run out of credits"
          /> */}
          {state.error ? (
            <FormNotification error>
              Something went wrong removing your card. Please try again or
              contact support.
            </FormNotification>
          ) : null}
        </>
      ) : (
        <>
          <p>No payment method stored.</p>
          <p>
            You will have to enter your card details each time you purchase a
            package.
          </p>
        </>
      )}
    </div>
  );
}

function BillingHistory() {
  const { value, loading, error } = useAsync(fetchBillingHistory);
  const history = loading || error ? {} : value;
  const { payments = [], has_more = false } = history;

  if (loading) return <span>Loading...</span>;
  return (
    <div styleName="billing-section history">
      <div styleName="content">
        <h2>History</h2>
        <p>
          Showing <TextImportant>{payments.length}</TextImportant> previous
          payments.
        </p>
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
    </div>
  );
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
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ op: 'remove-card' })
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

// function updateAutoBuy(autoBuy) {
//   return request('/api/me/billing', {
//     method: 'PATCH',
//     cache: 'no-cache',
//     credentials: 'same-origin',
//     headers: {
//       'Content-Type': 'application/json; charset=utf-8'
//     },
//     body: JSON.stringify({ op: 'update-autobuy', value: autoBuy })
//   });
// }
