import './score.module.scss';

import React from 'react';

export default React.memo(({ rank }) => {
  let label;
  if (rank === null || typeof rank === 'undefined') {
    label = 'unknown';
  } else {
    label = rank;
  }

  return (
    <span styleName="score" data-score={label}>
      {rank}
    </span>
  );
});
