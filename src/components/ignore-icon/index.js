import React from 'react';
import cx from 'classnames';

import './ignore-icon.css';

export default ({ ignored }) => (
  <span className={cx('add-to-ignore', { ignored })}>
    <svg
      viewBox="0 0 32 32"
      width="15"
      height="15"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M4 16 C1 12 2 6 7 4 12 2 15 6 16 8 17 6 21 2 26 4 31 6 31 12 28 16 25 20 16 28 16 28 16 28 7 20 4 16 Z" />
    </svg>
  </span>
);
