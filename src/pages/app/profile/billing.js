import './billing.module.scss';

import { ENTERPRISE, PACKAGES, USAGE_BASED } from '../../../utils/prices';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react';
import Table, { TableCell, TableRow } from '../../../components/table';
import { TextFootnote, TextImportant } from '../../../components/text';

import BillingModal from '../../../components/modal/billing';
import Button from '../../../components/btn';
import CardDetails from '../../../components/card-details';
import { DatabaseContext } from '../../../app/db-provider';
import ErrorBoundary from '../../../components/error-boundary';
import { FormCheckbox } from '../../../components/form';
import { ModalContext } from '../../../providers/modal-provider';
import PlanImage from '../../../components/pricing/plan-image';
import Price from '../../../components/pricing/price';
import ProfileLayout from './layout';
import Tooltip from '../../../components/tooltip';
import cx from 'classnames';
import format from 'date-fns/format';
import request from '../../../utils/request';
import { useAsync } from '../../../utils/hooks';
import useUser from '../../../utils/hooks/use-user';

function billingReducer(state, action) {
  const { type, data } = action;
  switch (type) {
    case 'set-billing':
      return { ...state, ...data };
    case 'set-loading':
      return { ...state, loading: data };
    case 'set-error':
      return { ...state, error: data };
    case 'set-setting':
      return {
        ...state,
        settings: { ...state.settings, [data.key]: data.value }
      };
    case 'remove-card':
      return {
        ...state,
        card: null
      };
    default:
      return state;
  }
}

const initialState = {
  credits: 0,
  creditsUsed: 0,
  card: null,
  previousPackageId: null,
  settings: {
    autoBuy: false,
    usageFallback: false
  }
};

export const BillingContext = createContext({ state: initialState });

export default function() {
  return (
    <ProfileLayout pageName="Billing">
      <Billing />
    </ProfileLayout>
  );
}

function Billing() {
  const [state, dispatch] = useReducer(billingReducer, initialState);
  const { open: openModal } = useContext(ModalContext);

  const [{ billing, organisationId }] = useUser(u => {
    return {
      billing: u.billing,
      organisationId: u.organisationId
    };
  });

  useEffect(
    () => {
      if (billing) {
        dispatch({
          type: 'set-billing',
          data: billing
        });
      }
    },
    [billing]
  );

  const onClickBuyPackage = useCallback(
    id => {
      const pkg = PACKAGES.find(p => p.id === id);
      openModal(
        <BillingModal selectedPackage={pkg} hasBillingCard={!!state.card} />
      );
    },
    [openModal, state.card]
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
    <BillingContext.Provider value={{ state, dispatch }}>
      <div styleName="billing-section information">
        <h2>Information</h2>
        <p>
          You have <TextImportant>{state.credits}</TextImportant> credits.
        </p>
        <p>
          You have used a total of{' '}
          <TextImportant>{state.creditsUsed}</TextImportant> credits.
        </p>
      </div>
      <Packages onClickBuy={onClickBuyPackage} />
      <Enterprise />
      <BillingDetails />
      <BillingHistory />
    </BillingContext.Provider>
  );
}

function UsageBased() {
  const { state, dispatch } = useContext(BillingContext);

  const isUsageActive = state.settings.usageFallback;

  return (
    <div styleName="billing-section">
      <h2>Usage Based</h2>
      <FormCheckbox
        onChange={() =>
          dispatch({
            type: 'set-setting',
            data: {
              key: 'usageFallback',
              value: !state.settings.usageFallback
            }
          })
        }
        checked={state.settings.usageFallback}
        label="Switch to usage based when you run out of unsubscribes"
      />
      <div styleName="plans-list">
        <PlanImage smaller compact type="usage-based" />
        <h3 styleName="plan-title">Per unsubscribe</h3>
        <Price price={USAGE_BASED.price} />
        <Tooltip
          overlay={
            <span>
              {isUsageActive
                ? 'Disable using the toggle above'
                : 'Enable using the toggle above'}
            </span>
          }
        >
          <span
            styleName={cx('payg-status', {
              active: isUsageActive,
              inactive: !isUsageActive
            })}
          >
            {isUsageActive ? 'Active' : 'Inactive'}
          </span>
        </Tooltip>
      </div>
      <TextFootnote>
        {isUsageActive
          ? 'When you run out of unsubscribes you will be able to continue unsubscribing which we will charge $0.10 per unsubscribe.'
          : 'When you run out of unsubscribes you will be unable to unsubscribe from any more emails and you will NOT be charged.'}
      </TextFootnote>
    </div>
  );
}

function Packages({ onClickBuy }) {
  const db = useContext(DatabaseContext);
  const { state, dispatch } = useContext(BillingContext);
  const { previousPackageId, settings } = state;
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

      <FormCheckbox
        onChange={() =>
          dispatch({
            type: 'set-setting',
            data: { key: 'autoBuy', value: !settings.autoBuy }
          })
        }
        checked={settings.autoBuy}
        label="Auto buy your previous package when you run out of credits"
      />

      {PACKAGES.map(p => {
        const isPreviousPackage = previousPackageId === p.id;
        const showReBuy = isPreviousPackage && !!state.card;
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
        Pssst - Currently your inbox contains approximately{' '}
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
        <a styleName="billing-btn">Contact</a>
      </div>
      <TextFootnote>* billed monthly.</TextFootnote>
    </div>
  );
}

function BillingDetails() {
  const { state, dispatch } = useContext(BillingContext);
  const { card } = state;

  const onClickRemoveCard = useCallback(
    async () => {
      dispatch({ type: 'set-loading', data: true });
      try {
        await removeUserBillingCard();
        dispatch({ type: 'remove-card' });
      } catch (err) {
        dispatch({ type: 'set-error', data: err });
      } finally {
        dispatch({ type: 'set-loading', data: false });
      }
    },
    [dispatch]
  );

  return (
    <div styleName="billing-section">
      <h2>Billing Details</h2>
      {card ? (
        <>
          <CardDetails card={card} />
          <Button
            basic
            compact
            stretch
            disabled={state.loading}
            loading={state.loading}
            onClick={() => onClickRemoveCard()}
          >
            Remove Card
          </Button>
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
          {payments.map(invoice => {
            return (
              <TableRow key={invoice.date}>
                <TableCell>{getDate(invoice)}</TableCell>
                <TableCell>{invoice.description}</TableCell>
                <TableCell>{getPrice(invoice)}</TableCell>
                <TableCell>{getStatus(invoice)}</TableCell>
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

async function removeUserBillingCard() {
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
