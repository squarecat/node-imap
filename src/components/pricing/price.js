import './price.module.scss';

import React from 'react';
import cx from 'classnames';

export default ({ children, price, discounted, inline }) => (
  <span
    styleName={cx('price', {
      discounted,
      inlinee: inline
    })}
  >
    {price < 50 ? (
      'Free'
    ) : (
      <>
        <span styleName="currency">$</span>
        {(price / 100).toFixed(2)}
        {children}
      </>
    )}
  </span>
);
