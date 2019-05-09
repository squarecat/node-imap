import './billing.module.scss';

import Table, { TableCell, TableRow } from '../../../../components/table';

import ErrorBoundary from '../../../../components/error-boundary';
import ProfileLayout from '../layout';
import React from 'react';
import { TextImportant } from '../../../../components/text';
import cx from 'classnames';
import format from 'date-fns/format';
import numeral from 'numeral';
import request from '../../../../utils/request';
import { useAsync } from '../../../../utils/hooks';

async function fetchBillingHistory() {
  return request('/api/me/billing', {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

export default function BillingHistory() {
  const { value: billingData = {}, loading } = useAsync(fetchBillingHistory);
  const { payments = [], has_more = false } = billingData;

  return (
    <ProfileLayout pageName="Billing History">
      {loading ? (
        <span>Loading...</span>
      ) : (
        <div styleName="billing-section">
          <p>
            Showing <TextImportant>{payments.length}</TextImportant> previous
            payments.
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
