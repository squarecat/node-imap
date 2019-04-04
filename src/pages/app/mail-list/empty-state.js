import './empty-state.module.scss';

import { TextImportant, TextLink } from '../../../components/text';

import { Link } from 'gatsby';
import React from 'react';
import distanceInWordsStrict from 'date-fns/distance_in_words_strict';
import format from 'date-fns/format';
import { isRescanAvailable } from '../../../utils/scans';
import subDays from 'date-fns/sub_days';
import subMonths from 'date-fns/sub_months';
import subWeeks from 'date-fns/sub_weeks';

const dateFormat = 'Do MMMM YYYY';

const tfToString = {
  '3d': '3 day scan',
  '1w': '1 week scan',
  '1m': '1 month scan',
  '6m': '6 month scan'
};

export default ({ showPriceModal, lastScan, onClickRescan }) => {
  let content = null;
  let dateContent = null;

  const rescanAvailable = isRescanAvailable(lastScan);
  const lastScanResultsCount = lastScan
    ? lastScan.totalUnsubscribableEmails
    : 0;

  if (lastScan) {
    dateContent = (
      <div styleName="scan-dates">
        <p key={lastScan.timeframe}>
          You performed a {tfToString[lastScan.timeframe]}{' '}
          {distanceInWordsStrict(new Date(), lastScan.scannedAt)} ago -{' '}
          <span styleName="scan-history-link">
            <Link to="/app/profile/history/scans">see your scan history</Link>.
          </span>
        </p>
        {rescanAvailable ? (
          <p>
            You can{' '}
            <TextLink
              undecorated
              onClick={() => onClickRescan(lastScan.timeframe)}
            >
              run this scan again
            </TextLink>{' '}
            up to 24 hours after purchase.
          </p>
        ) : null}
      </div>
    );
  }

  if (lastScanResultsCount) {
    const fromDate = format(getTimeRange(lastScan), dateFormat);
    const toDate = format(lastScan.scannedAt, dateFormat);
    content = (
      <>
        <h3>No mail subscriptions found</h3>
        <h4>Are you using a different device/browser?</h4>
        {dateContent}
        <p>
          In line with our privacy policy we do not store store any of your
          emails on our servers, they are all stored in your browser.
        </p>
        <p>
          The results of your scan between{' '}
          <TextImportant>{fromDate}</TextImportant> and{' '}
          <TextImportant>{toDate}</TextImportant> will still be available on the
          device and browser you used to originally run this scan.
        </p>
        {renderScanBtn(rescanAvailable, () =>
          onClickRescan(lastScan.timeframe)
        )}
      </>
    );
  } else {
    content = (
      <>
        <h3>No mail subscriptions found! 🎉</h3>
        {dateContent}
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

function renderScanBtn(rescanAvailable, onClickRescan) {
  if (rescanAvailable) {
    return (
      <button styleName="scan-btn" onClick={() => onClickRescan()}>
        Re-run my last scan
      </button>
    );
  }
  return null;
}
