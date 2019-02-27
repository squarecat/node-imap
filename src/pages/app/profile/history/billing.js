import './scans.css';

import ErrorBoundary from '../../../../components/error-boundary';
import ProfileLayout from '../layout';
import React from 'react';
import format from 'date-fns/format';
import numeral from 'numeral';
import { useAsync } from '../../../../utils/hooks';

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
        <div className="profile-section profile-section--unpadded">
          <p>
            Showing <span className="text-important">{payments.length}</span>{' '}
            previous payments.
          </p>
          <ErrorBoundary>
            <table className="scan-table">
              <tbody>
                {payments.map(invoice => {
                  return (
                    <tr key={invoice.date} className="scan-item">
                      <td>{getDate(invoice)}</td>
                      <td>{invoice.description}</td>
                      <td>{getPrice(invoice)}</td>
                      <td>{getStatus(invoice)}</td>
                      <td>
                        {invoice.invoice_pdf ? (
                          <a
                            className="btn muted compact basic invoice-btn"
                            href={invoice.invoice_pdf}
                            target="_"
                          >
                            Download
                          </a>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
    return <span className="invoice-status invoice--refunded">Refunded</span>;
  }
  if (!attempted) {
    return <span className="invoice-status invoice--pending">Recieved</span>;
  }
  if (!paid) {
    return <span className="invoice-status invoice--failed">Failed</span>;
  }
  return <span className="invoice-status invoice--paid">Paid</span>;
}
