import './billing.module.scss';

import { ENTERPRISE, PACKAGES, USAGE_BASED } from '../../../utils/prices';
import { Elements, StripeProvider } from 'react-stripe-elements';
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState
} from 'react';
import Table, { TableCell, TableRow } from '../../../components/table';
import {
  TextFootnote,
  TextImportant,
  TextLink
} from '../../../components/text';
import Button from '../../../components/btn';

import BillingModal from '../../../components/modal/billing';
import CardDetails from '../../../components/modal/billing/card-details';
import ErrorBoundary from '../../../components/error-boundary';
import { FormCheckbox } from '../../../components/form';
import PlanImage from '../../../components/pricing/plan-image';
import ProfileLayout from './layout';
import Tooltip from 'rc-tooltip';
import cx from 'classnames';
import format from 'date-fns/format';
import numeral from 'numeral';
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
  unsubscribesRemaining: 0,
  unsubscribesUsed: 0,
  card: null,
  previousPackageId: null,
  settings: {
    autoBuy: false,
    usageFallback: false
  }
};

export const BillingContext = createContext({ state: initialState });

export default function Billing() {
  const [state, dispatch] = useReducer(billingReducer, initialState);
  const [showBillingModal, toggleBillingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(PACKAGES[0]);

  const [{ billing }] = useUser(u => {
    return {
      billing: u.billing
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

  const { unsubscribesRemaining, unsubscribesUsed } = state;

  return (
    <ProfileLayout pageName="Billing">
      <BillingContext.Provider value={{ state, dispatch }}>
        <div styleName="billing-section information">
          <h2>Information</h2>
          <p>
            You have <TextImportant>{unsubscribesRemaining}</TextImportant>{' '}
            unsubscribes remaining{' '}
            {unsubscribesRemaining === 0 ? (
              <TextLink href="#packages">buy more</TextLink>
            ) : null}
            .
          </p>
          <p>
            You have used a total of{' '}
            <TextImportant>{unsubscribesUsed}</TextImportant> unsubscribes.
          </p>
          {unsubscribesRemaining > 0 ? (
            <p>
              These unsubscribes will last{' '}
              <TextImportant>forever</TextImportant>.
            </p>
          ) : null}
        </div>
        <UsageBased />
        <Packages
          onClickBuy={id => {
            const pkg = PACKAGES.find(p => p.id === id);
            setSelectedPackage(pkg);
            toggleBillingModal(true);
          }}
        />
        <Enterprise />
        <BillingDetails />
        <BillingHistory />
        {showBillingModal ? (
          <StripeProvider apiKey={process.env.STRIPE_PK}>
            <Elements>
              <BillingModal
                selectedPackage={selectedPackage}
                step={
                  state.card
                    ? 'existing-billing-details'
                    : 'enter-billing-details'
                }
                onClose={() => toggleBillingModal(false)}
              />
            </Elements>
          </StripeProvider>
        ) : null}
      </BillingContext.Provider>
    </ProfileLayout>
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
        <p styleName="price">
          <span styleName="currency">$</span>
          {USAGE_BASED.price.toFixed(2)}
        </p>
        <Tooltip
          placement="top"
          trigger={['hover']}
          mouseLeaveDelay={0}
          overlayClassName="tooltip"
          destroyTooltipOnHide={true}
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
  const { state, dispatch } = useContext(BillingContext);
  const { previousPackageId, settings } = state;

  return (
    <div styleName="billing-section" id="packages">
      <h2>Packages</h2>
      <FormCheckbox
        onChange={() =>
          dispatch({
            type: 'set-setting',
            data: { key: 'autoBuy', value: !settings.autoBuy }
          })
        }
        checked={settings.autoBuy}
        label="Auto buy your last package when you run out of unsubscribes"
      />

      {PACKAGES.map(p => {
        const isPreviousPackage = previousPackageId === p.id;
        let discountText;
        if (p.id > previousPackageId) {
          discountText = `Save ${p.discount * 100}%`;
        }
        return (
          <div styleName="plans-list" key={p.unsubscribes}>
            <PlanImage smaller compact type="package" />
            <h3 styleName="plan-title">{p.unsubscribes} unsubscribes</h3>
            <p styleName="price">
              <span styleName="currency">$</span>
              {(p.price / 100).toFixed(2)}
            </p>
            <div>
              <a
                styleName="billing-btn package-buy-btn"
                onClick={() => onClickBuy(p.id)}
              >
                {isPreviousPackage ? 'Re-buy' : 'Buy'}
              </a>
              <span styleName="package-discount">{discountText}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Enterprise() {
  const { state } = useContext(BillingContext);
  return (
    <div styleName="billing-section">
      <h2>Enterprise</h2>
      <div styleName="plans-list">
        <PlanImage smaller compact type="enterprise" />
        <div>
          <h3 styleName="plan-title">Unlimited unsubscribes</h3>
          <span>Up to {ENTERPRISE.seats} seats</span>
        </div>
        <p styleName="price">
          <span styleName="currency">$</span>
          {ENTERPRISE.price.toFixed(2)}*
        </p>
        <a styleName="billing-btn">Contact</a>
      </div>
      <TextFootnote>
        * prices start from ${ENTERPRISE.price.toFixed(2)} for up to 10 seats.
      </TextFootnote>
    </div>
  );
}

function BillingDetails() {
  const { state, dispatch } = useContext(BillingContext);
  const { card } = state;

  async function removeCard() {
    dispatch({ type: 'set-loading', data: true });
    try {
      await removeUserBillingCard();
      dispatch({ type: 'remove-card' });
    } catch (err) {
      dispatch({ type: 'set-error', data: err });
    } finally {
      dispatch({ type: 'set-loading', data: false });
    }
  }

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
            onClick={() => removeCard()}
          >
            Remove Card
          </Button>
        </>
      ) : (
        <>
          <p>No credit card stored.</p>
          <p>
            You will have to enter your billing details each time you purchase a
            package.
          </p>
        </>
      )}
    </div>
  );
}

function BillingHistory() {
  const { value, loading } = useAsync(fetchBillingHistory);
  const history = loading ? {} : value;
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
  const res = await fetch('/api/me/billing', {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
  return res.json();
}

async function removeUserBillingCard() {
  const resp = await fetch('/api/me/billing', {
    method: 'PATCH',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ op: 'remove-card' })
  });
  return resp.json();
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
