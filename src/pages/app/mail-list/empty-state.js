import './empty-state.module.scss';

import { Link } from 'gatsby';
import React from 'react';
import { TextImportant } from '../../../components/text';
import format from 'date-fns/format';
import isAfter from 'date-fns/is_after';
import subDays from 'date-fns/sub_days';
import subHours from 'date-fns/sub_hours';
import subMonths from 'date-fns/sub_months';
import subWeeks from 'date-fns/sub_weeks';
import useUser from '../../../utils/hooks/use-user';

const dateFormat = 'Do MMM YYYY';

const tfToString = {
  '3d': '3 day scan',
  '1w': '1 week scan',
  '1m': '1 month scan',
  '6m': '6 month scan'
};

export default ({ showPriceModal, onClickRescan }) => {
  const [lastScan] = useUser(u => u.lastScan);

  const yesterday = subHours(Date.now(), 24);
  const isRescanAvailable = isAfter(lastScan.scannedAt, yesterday);

  const fromDate = format(getTimeRange(lastScan), dateFormat);
  const toDate = format(lastScan.scannedAt, dateFormat);

  let title = isRescanAvailable
    ? 'Re-run your last scan'
    : 'Use the same device and browser you used to run this scan';
  let content = null;
  if (lastScan) {
    content = (
      <>
        <h3>{title}</h3>
        <p>
          We can see that you performed a{' '}
          <TextImportant>{tfToString[lastScan.timeframe]}</TextImportant> on{' '}
          <TextImportant>
            {format(lastScan.scannedAt, dateFormat)}
          </TextImportant>{' '}
          for subscription emails received between{' '}
          <TextImportant>{fromDate}</TextImportant> and{' '}
          <TextImportant>{toDate}</TextImportant>.
        </p>
        <p>
          To adhere to our privacy policy we do not store store any of your
          emails on our server, they are all stored in your browser.
        </p>
        <p>
          The results of your scan will still be available on the device and
          browser you used to originally run this scan.
        </p>
        {renderScanText(isRescanAvailable, () =>
          onClickRescan(lastScan.timeframe)
        )}
      </>
    );
  } else {
    content = (
      <>
        <h3>No mail subscriptions found! 🎉</h3>
        <p>Enjoy your clear inbox!</p>
        <p>
          If you're still getting subscription emails then try searching{' '}
          <a onClick={showPriceModal}>over a longer period</a>.
        </p>
      </>
    );
  }

  return (
    <div styleName="mail-empty-state">
      <div styleName="content">{content}</div>
    </div>
  );
};

function getTimeRange({ scannedAt, timeframe }) {
  let then;
  const [value, unit] = timeframe;
  if (unit === 'd') {
    then = subDays(scannedAt, value);
  } else if (unit === 'w') {
    then = subWeeks(scannedAt, value);
  } else if (unit === 'm') {
    then = subMonths(scannedAt, value);
  }
  return then;
}

function renderScanText(isRescanAvailable, onClickRescan) {
  if (isRescanAvailable) {
    return (
      <>
        <p>
          Your scan was last run less than 24 hours, so you can{' '}
          <TextImportant>run it again for free</TextImportant> by clicking the
          button below.
        </p>
        <button styleName="scan-btn" onClick={() => onClickRescan()}>
          Re-run my last scan
        </button>
      </>
    );
  }
  return null;
}
