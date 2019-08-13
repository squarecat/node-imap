import './browser.module.scss';

import React from 'react';
import cx from 'classnames';

export default ({ children, large }) => (
  <div styleName={cx('browser-container', { large })}>
    <div styleName="header">
      <div styleName="header-dot red" />
      <div styleName="header-dot yellow" />
      <div styleName="header-dot green" />
    </div>
    <div styleName="content">{children}</div>
  </div>
);
