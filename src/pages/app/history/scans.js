import React from 'react';
import relative from 'tiny-relative-date';
import Template from '../template';
import subHours from 'date-fns/sub_hours';
import isAfter from 'date-fns/is_after';

import { useAsync } from '../../../utils/hooks';
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
  const { value: scans, loading } = useAsync(fetchScanHistory);
  if (loading) {
    return null;
  }
  return (
    <Template>
      <div className="scan-list">
        <p>
          Showing <span className="scan-size">{scans.length}</span> previous
          scans.
        </p>
        <table>
          <tbody>
            {scans.map(scan => {
              const yesterday = subHours(Date.now(), 24);
              return (
                <tr key={scan.scannedAt} className="scan-item">
                  <td>{relative(scan.scannedAt)}</td>
                  <td>{tfToString[scan.timeframe]}</td>
                  <td>{`${scan.totalUnsubscribableEmails} emails found`}</td>
                  <td>
                    {isAfter(scan.scannedAt, yesterday) ? (
                      <Button
                        compact
                        linkTo="/app"
                        linkArgs={{ rescan: scan.timeframe }}
                      >
                        Re-scan
                      </Button>
                    ) : (
                      <Button compact basic muted>
                        Invoice
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Template>
  );
}
