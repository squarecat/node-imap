import isAfter from 'date-fns/is_after';
import subHours from 'date-fns/sub_hours';

export function isRescanAvailable(lastScan) {
  if (!lastScan) {
    return false;
  }

  const { totalUnsubscribableEmails, timeframe, scannedAt } = lastScan;

  if (totalUnsubscribableEmails === 0 || timeframe === '3d') {
    return false;
  }

  const yesterday = subHours(Date.now(), 24);
  const rescanAvailable = isAfter(scannedAt, yesterday);

  if (!rescanAvailable) return false;

  return true;
}
