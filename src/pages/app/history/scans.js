import React from 'react';
import relative from 'tiny-relative-date';
import Template from '../template';
import subHours from 'date-fns/sub_hours';
import isAfter from 'date-fns/is_after';
import { Link } from 'gatsby';

import { useAsync } from '../../../utils/hooks';
import ErrorBoundary from '../../../components/error-boundary';
import Button from '../../../components/btn';

import './scans.css';

async function fetchScanHistory() {
  const res = await fetch('/api/me/scans');
  return res.json();
}

const tfToString = {
  '3d': '3 day scan',
  '1w': '1 week scan',
  '1m': '1 month scan',
  '6m': '6 month scan'
};

export default function ScanHistory() {
  const { value, loading } = useAsync(fetchScanHistory);
  const scans = loading ? [] : value;
  return (
    <Template>
      <div className="scan-list">
        <p>
          <Link to="/app">&lt; Back to scan</Link>
        </p>

        <p>
          Showing <span className="scan-size">{scans.length}</span> previous
          scans.
        </p>
        <ErrorBoundary>
          <table>
            <tbody>
              {scans.map((scan, i) => {
                return (
                  <tr key={scan.scannedAt} className="scan-item">
                    <td>
                      {i === 0 ? (
                        <Link className="link" to="/app">
                          {relative(scan.scannedAt)}
                        </Link>
                      ) : (
                        relative(scan.scannedAt)
                      )}
                    </td>
                    <td>{tfToString[scan.timeframe]}</td>
                    <td>{`${scan.totalUnsubscribableEmails} emails found`}</td>
                    <td>{renderButton(scan)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ErrorBoundary>
      </div>
    </Template>
  );
}

function renderButton(scan) {
  const yesterday = subHours(Date.now(), 24);
  if (isAfter(scan.scannedAt, yesterday)) {
    return (
      <Button compact linkTo="/app" linkArgs={{ rescan: scan.timeframe }}>
        Re-scan
      </Button>
    );
  } else if (scan.receiptUrl) {
    // TODO
    return (
      <Button compact basic muted>
        Invoice
      </Button>
    );
  }
  return null;
}
