import './progress.module.scss';

import React from 'react';
import useProgress from '../../app/mail-list/db/use-progress';

export default function Progress() {
  const progress = useProgress();
  const accountProgress = Object.keys(progress).map(account => ({
    label: account,
    percentage: progress[account]
  }));
  console.log(progress);
  return (
    <div styleName="progress">
      <ul>
        {accountProgress.map(p => {
          return <li key={p.label}>{p.percentage}</li>;
        })}
      </ul>
    </div>
  );
}
