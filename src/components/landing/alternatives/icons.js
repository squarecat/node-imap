import './alternative-icons.module.scss';

import React from 'react';

export const AlternativeCheck = ({ text = 'Yes' }) => (
  <div styleName="container">
    <span styleName="icon check" />
    <span>{text}</span>
  </div>
);

export const AlternativeCross = ({ text = 'No' }) => (
  <div styleName="container">
    <span styleName="icon cross" />
    <span>{text}</span>
  </div>
);
