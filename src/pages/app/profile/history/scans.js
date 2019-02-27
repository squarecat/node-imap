import './scans.module.scss';

import Button from '../../../../components/btn';
import ErrorBoundary from '../../../../components/error-boundary';
import { Link } from 'gatsby';
import ProfileLayout from '../layout';
import React from 'react';
import isAfter from 'date-fns/is_after';
import relative from 'tiny-relative-date';
import subHours from 'date-fns/sub_hours';
import { useAsync } from '../../../../utils/hooks';
import { TextImportant } from '../../../../components/text';
import Table, { TableRow, TableCell } from '../../../../components/table';

async function fetchScanHistory() {
  const res = await fetch('/api/me/scans', {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
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
    <ProfileLayout pageName="Scan History">
      {loading ? (
        <span>Loading...</span>
      ) : (
        <div styleName="scan-section">
          <p>
            Showing <TextImportant>{scans.length}</TextImportant> previous
            scans.
          </p>
          <ErrorBoundary>
            <Table>
              {scans.map((scan, i) => {
                return (
                  <TableRow key={scan.scannedAt}>
                    <TableCell>
                      {i === 0 ? (
                        <Link styleName="scan-link" to="/app">
                          {relative(scan.scannedAt)}
                        </Link>
                      ) : (
                        relative(scan.scannedAt)
                      )}
                    </TableCell>
                    <TableCell>{tfToString[scan.timeframe]}</TableCell>
                    <TableCell>{`${
                      scan.totalUnsubscribableEmails
                    } emails found`}</TableCell>
                    <TableCell>{renderButton(scan)}</TableCell>
                  </TableRow>
                );
              })}
            </Table>
          </ErrorBoundary>
        </div>
      )}
    </ProfileLayout>
  );
}

function renderButton(scan) {
  const yesterday = subHours(Date.now(), 24);
  if (isAfter(scan.scannedAt, yesterday)) {
    return (
      <Link styleName="scan-btn" to="/app" state={{ rescan: scan.timeframe }}>
        Re-scan
      </Link>
    );
  }
  return null;
}
