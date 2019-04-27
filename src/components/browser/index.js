import React from 'react';

import './browser.module.scss';

export default ({ children }) => (
  <div styleName="browser-container shadowed">
    <div styleName="header">
      <div styleName="header-dot red" />
      <div styleName="header-dot yellow" />
      <div styleName="header-dot green" />
    </div>
    <div styleName="content">{children}</div>
  </div>
);
