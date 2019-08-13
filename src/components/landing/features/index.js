import './landing-features.module.scss';

import React from 'react';

export default ({ children }) => {
  return <div styleName="features">{children}</div>;
};

export const Feature = ({ children }) => (
  <div styleName="feature">{children}</div>
);

export const FeatureImage = ({ children }) => (
  <div styleName="feature-img">{children}</div>
);

export const FeatureTitle = ({ children }) => (
  <h3 styleName="feature-title">{children}</h3>
);

export const FeatureText = ({ children }) => (
  <div styleName="feature-text">{children}</div>
);
