import './browser.module.scss';

import React from 'react';

export default ({ children }) => (
  <div styleName="browser-container">
    <div styleName="header">
      <div styleName="header-dot red" />
      <div styleName="header-dot yellow" />
      <div styleName="header-dot green" />
    </div>
    <div styleName="content">{children}</div>
  </div>
);
