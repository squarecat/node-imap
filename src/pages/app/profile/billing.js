import './billing.module.scss';

import Table, { TableCell, TableRow } from '../../../components/table';

import Button from '../../../components/btn';
import ErrorBoundary from '../../../components/error-boundary';
import ProfileLayout from './layout';
import React from 'react';
import { TextImportant } from '../../../components/text';
import cx from 'classnames';
import format from 'date-fns/format';
import numeral from 'numeral';
import { useAsync } from '../../../utils/hooks';

async function fetchBillingHistory() {
  const res = await fetch('/api/me/billing', {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
  return res.json();
}

export default function Billing() {
  return (
    <ProfileLayout pageName="Billing">
      <div styleName="billing-section">
        <h2>Package</h2>
        <p>You have 5 unsubscribes remaining.</p>
        <p>You can get more unsubscribes for free by... </p>
        <Button compact basic smaller outlined muted onClick={() => {}}>
          Tweet about us
        </Button>
        <Button compact basic smaller outlined muted onClick={() => {}}>
          Connect another account
        </Button>
        <Button compact basic smaller outlined muted onClick={() => {}}>
          Connect/use an integration
        </Button>
        <Button compact basic smaller outlined muted onClick={() => {}}>
          Refer a friend signup
        </Button>
        <Button compact basic smaller outlined muted onClick={() => {}}>
          Refer a friend purchase
        </Button>
      </div>
      <BillingHistory />
    </ProfileLayout>
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
