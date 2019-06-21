import './score.module.scss';

import React from 'react';
import { TextImportant } from '../text';
import Tooltip from '../tooltip';

export default React.memo(({ score, address, rank, unsubscribePercentage }) => {
  let label;
  if (rank === null || typeof rank === 'undefined') {
    label = 'unknown';
  } else {
    label = rank;
  }

  return (
    <Tooltip
      white
      placement="left"
      overlay={tooltipContent({
        score,
        rank,
        address,
        label,
        percentage: unsubscribePercentage
      })}
    >
      <span styleName="score" data-score={label}>
        {rank}
      </span>
    </Tooltip>
  );
});
const ranks = {
  F: 0,
  E: 20,
  D: 30,
  C: 40,
  B: 50,
  A: 70,
  'A+': 90
};

function tooltipContent({ score, rank, address, label, percentage = 0 }) {
  let content;
  let rankLabel;
  if (!rank) {
    rankLabel = '-Unknown';
    content = (
      <p>We don't have enough data on this sender to give it a rank.</p>
    );
  } else {
    const percentile = ranks[rank];
    const asArray = Object.keys(ranks);
    const negativePercentile = ranks[asArray[asArray.indexOf(rank) + 1]];
    rankLabel = `${rank} - ${(score * 10).toFixed(2)}`;
    content = (
      <>
        <p>
          <TextImportant>{address}</TextImportant> is{' '}
          <TextImportant>{percentile < 50 ? 'worse' : 'better'}</TextImportant>{' '}
          than{' '}
          <TextImportant>
            {percentile < 50 ? 100 - negativePercentile : percentile}%
          </TextImportant>{' '}
          of known senders, based on email frequency and reputation.
        </p>
        <p>
          <TextImportant>{(percentage * 100).toFixed(0)}%</TextImportant> of
          users unsubscribe from these emails.
        </p>
      </>
    );
  }

  return (
    <div styleName="score-tooltip">
      <div styleName="scores">
        <span styleName="score numeric" data-score={label}>
          {rankLabel}
        </span>
      </div>
      {content}
    </div>
  );
}
