import './price.module.scss';

import React from 'react';
import cx from 'classnames';

export default ({ price, discounted, asterisk }) => (
  <p
    styleName={cx('price', {
      discounted,
      asterisk
    })}
  >
    <span styleName="currency">$</span>
    {(price / 100).toFixed(2)}
  </p>
);
