import React, { useEffect, useRef, useState } from 'react';

import Spinner from '../../../components/loading/spinner';
import cx from 'classnames';
import styles from './progress.module.scss';
import useProgress from '../db/use-progress';
import useUser from '../../../utils/hooks/use-user';

export default ({ shown }) => {
  const [showLoader, setShowLoader] = useState(false);

  const popupStyles = cx(styles.loaderPopup, {
    [styles.shown]: showLoader
  });

  return (
    <div styleName={`loader ${shown ? 'shown' : ''}`}>
      <span
        styleName="loader-toggle"
        onMouseEnter={() => setShowLoader(true)}
        onMouseLeave={() => setShowLoader(false)}
        data-loading={shown}
      >
        <Spinner shown={shown} />
      </span>
      <span className={popupStyles}>
        <AccountProgress />
      </span>
    </div>
  );
};

function AccountProgress() {
  const [accounts] = useUser(({ accounts }) => accounts);
  const progress = useProgress();

  const accountProgress = Object.keys(progress).map(account => ({
    label: account,
    percentage: progress[account]
  }));
  const progressList = accounts.map(a => {
    const ac = accountProgress.find(ap => ap.label === a.email);
    return {
      label: ac ? ac.label : a.email,
      percentage: ac ? Math.round(ac.percentage) : 0
    };
  });

  let searchText = 'Searching for new mail...';
  if (progressList.every(({ percentage }) => percentage === 100)) {
    searchText = 'Search finished.';
  }
  return (
    <div styleName="progress">
      <p>{searchText}</p>
      <ul>
        {progressList.map(p => {
          let width = p.percentage;
          if (width > 100) {
            width = 99;
          }

          return (
            <Item key={p.label} percentage={p.percentage} label={p.label} />
          );
        })}
      </ul>
    </div>
  );
}

const Item = React.memo(({ percentage, label }) => {
  const ref = useRef(null);
  // create a smoother progress bar update
  useEffect(() => {
    requestAnimationFrame(() => {
      if (ref && ref.current) {
        ref.current.style.width = `${percentage}%`;
      }
    });
  }, [percentage]);

  return (
    <li key={label}>
      <div styleName="bar">
        <span ref={ref} data-value={percentage} styleName="top-bar">
          <span styleName="bar-progress">
            <span styleName="bar-label">{label}</span>
            <span styleName="bar-value">{percentage}%</span>
          </span>
        </span>
        <span styleName="under-bar">
          <span styleName="bar-label">{label}</span>
          <span styleName="bar-value">{percentage}%</span>
        </span>
      </div>
    </li>
  );
});
