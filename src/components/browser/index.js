import React from 'react';
import cx from 'classnames';
import styles from './browser.module.scss';

export default ({ children, large, hideOnMobile }) => (
  <div
    className={cx(styles.browserContainer, {
      [styles.large]: large,
      [styles.hideOnMobile]: hideOnMobile
    })}
  >
    <div styleName="header">
      <div styleName="header-dot red" />
      <div styleName="header-dot yellow" />
      <div styleName="header-dot green" />
    </div>
    <div styleName="content">{children}</div>
  </div>
);
