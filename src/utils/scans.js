import isAfter from 'date-fns/is_after';
import subHours from 'date-fns/sub_hours';

export const tfToString = {
  '3d': '3 day scan',
  '1w': '1 week scan',
  '1m': '1 month scan',
  '6m': '6 month scan'
};

export const tfToStringShort = {
  '3d': '3 days',
  '1w': '1 week',
  '1m': '1 month',
  '6m': '6 months'
};

export function isRescanAvailable(lastScan) {
  if (!lastScan) {
    return false;
  }

  const { totalUnsubscribableEmails, timeframe, scannedAt } = lastScan;

  if (!totalUnsubscribableEmails || timeframe === '3d') {
    return false;
  }

  const yesterday = subHours(Date.now(), 24);
  const rescanAvailable = isAfter(scannedAt, yesterday);

  if (!rescanAvailable) return false;

  return true;
}
