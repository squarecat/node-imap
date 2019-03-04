import './billing.module.scss';

import ErrorBoundary from '../../../../components/error-boundary';
import ProfileLayout from '../layout';
import React from 'react';
import format from 'date-fns/format';
import numeral from 'numeral';
import { useAsync } from '../../../../utils/hooks';

import Table, { TableRow, TableCell } from '../../../../components/table';

async function fetchBillingHistory() {
  const res = await fetch('/api/me/billing', {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
  return res.json();
}

export default function BillingHistory() {
  const { value, loading } = useAsync(fetchBillingHistory);
  const billingData = loading ? {} : value;
  const { payments = [], has_more = false } = billingData;

  return (
    <ProfileLayout pageName="Billing History">
      {loading ? (
        <span>Loading...</span>
      ) : (
        <div styleName="billing-section">
          <p>
            Showing <span className="text-important">{payments.length}</span>{' '}
            previous payments.
          </p>
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
          </ErrorBoundary>
          {has_more ? <p>For older invoices please contact support.</p> : null}
        </div>
      )}
    </ProfileLayout>
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
  return (
    <span
      className={`invoice-price ${refunded ? 'invoice-price--refunded' : ''}`}
    >
      {display}
    </span>
  );
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
