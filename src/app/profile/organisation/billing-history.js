import './org.module.scss';

import React, { useMemo } from 'react';
import Table, { TableCell, TableRow } from '../../../components/table';

import ErrorBoundary from '../../../components/error-boundary';
import { TextImportant } from '../../../components/text';
import format from 'date-fns/format';
import request from '../../../utils/request';
import useAsync from 'react-use/lib/useAsync';

function OrgBillingHistory({ organisationId }) {
  const { value, loading, error } = useAsync(
    () => fetchBillingHistory(organisationId),
    [organisationId]
  );

  const content = useMemo(
    () => {
      const history = loading || error ? {} : value;
      const { payments = [], has_more = false } = history;
      let text;
      if (loading) {
        text = <span>Loading...</span>;
      } else if (!payments.length) {
        text = <p>No invoices yet.</p>;
      } else {
        text = (
          <p>
            Showing{' '}
            <TextImportant>
              {`${payments.length} invoice${payments.length === 1 ? '' : 's'}`}
            </TextImportant>
            .
          </p>
        );
      }

      return (
        <>
          <div styleName="table-text-content">
            <h2>Invoice history</h2>
            {text}
          </div>
          <ErrorBoundary>
            <Table>
              <tbody>
                {payments.map(invoice => {
                  return (
                    <TableRow key={invoice.date}>
                      <TableCell>{getPaymentDate(invoice)}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>{getPrice(invoice.price)}</TableCell>
                      <TableCell>
                        <a
                          styleName="invoice-btn"
                          href={invoice.invoice_pdf}
                          target="_"
                        >
                          Download
                        </a>
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
    },
    [error, loading, value]
  );

  return <div styleName="organisation-section tabled">{content}</div>;
}

function getPaymentDate({ date }) {
  return format(date * 1000, 'DD/MM/YYYY');
}

function getPrice(price) {
  const display = (price / 100).toFixed(2);

  return <span styleName="invoice-price">${display}</span>;
}

async function fetchBillingHistory(id) {
  return request(`/api/organisation/${id}/billing`, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

export default OrgBillingHistory;
