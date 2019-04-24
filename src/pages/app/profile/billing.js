import './billing.module.scss';

import React, { createContext, useReducer } from 'react';
import Table, { TableCell, TableRow } from '../../../components/table';

import ErrorBoundary from '../../../components/error-boundary';
import { FormCheckbox } from '../../../components/form';
import ProfileLayout from './layout';
import { TextImportant } from '../../../components/text';
import cx from 'classnames';
import format from 'date-fns/format';
import numeral from 'numeral';
import { useAsync } from '../../../utils/hooks';

function billingReducer(state, action) {
  const { type, data } = action;
  switch (type) {
    case 'set-billing':
      return { ...state, ...data };
    case 'set-setting':
      return {
        ...state,
        settings: { ...state.settings, [data.key]: data.value }
      };
    default:
      return state;
  }
}

const initialState = {
  customerId: null,
  card: null,
  package: null,
  settings: {
    autoBuy: false,
    usageFallback: false
  }
};

export const BillingContext = createContext({ state: initialState });

export default function Billing() {
  const [state, dispatch] = useReducer(billingReducer, initialState);

  return (
    <ProfileLayout pageName="Billing">
      <BillingContext.Provider value={{ state, dispatch }}>
        <div styleName="billing-section">
          <h2>Settings</h2>
          <FormCheckbox
            onChange={e =>
              dispatch({
                type: 'set-setting',
                data: { key: 'autoBuy', value: e.currentTarget.checked }
              })
            }
            checked={state.settings.autoBuy}
            label="Re-buy last package when you run out of unsubscribes"
          />
          <FormCheckbox
            onChange={() =>
              dispatch({
                type: 'set-setting',
                data: { key: 'usageFallback', value: e.currentTarget.checked }
              })
            }
            checked={state.settings.usageFallback}
            label="Switch to usage based when you run out of unsubscribes"
          />
        </div>
        <BuyPackage />
        <BillingDetails />
        <BillingHistory />
      </BillingContext.Provider>
    </ProfileLayout>
  );
}

function BuyPackage() {
  return (
    <div styleName="billing-section">
      <h2>Buy Package</h2>
      <p>Buy one of our packages:</p>
      <ul>
        <li>Usage Based</li>
        <li>Packages</li>
        <li>Enterprise</li>
      </ul>
    </div>
  );
}

function BillingDetails() {
  return (
    <div styleName="billing-section">
      <h2>Card</h2>
      <p>Last 4: 4242</p>
      <p>Expiry: 04/12</p>
    </div>
  );
}

function BillingHistory() {
  const { value, loading } = useAsync(fetchBillingHistory);
  const billingData = loading ? {} : value;
  const { payments = [], has_more = false } = billingData;

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

function getDate({ date }) {
  return format(date * 1000, 'DD/MM/YYYY HH:mm');
}

function getPrice({ price, refunded }) {
  const display =
    price % 2 > 0
      ? numeral(price / 100).format('$0,0.00')
      : numeral(price / 100).format('$0,0');
  const classes = cx('invoice-price', {
    'invoice-price--refunded': refunded
  });
  return <span styleName={classes}>{display}</span>;
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
