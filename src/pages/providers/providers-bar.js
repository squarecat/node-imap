import './providers-bar.module.scss';

import React from 'react';
import cx from 'classnames';

export default function ProviderBar({ logos, ...visProps }) {
  const classes = cx('providers-bar', {
    dark: visProps.dark,
    spaced: visProps.spaced
  });
  return (
    <div styleName={classes}>
      <div styleName="providers-bar-images">
        {logos.map(({ name, img }, index) => (
          <span key={`logo-${index}`} styleName="providers-bar-img">
            <img src={img} alt={`${name} logo`} />
          </span>
        ))}
      </div>
    </div>
  );
}
