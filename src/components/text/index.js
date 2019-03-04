import './text.module.scss';

import React from 'react';
import cx from 'classnames';

export const TextLink = ({ children, smaller, ...props }) => {
  const classes = cx('link', {
    smaller
  });
  return (
    <a styleName={classes} {...props}>
      {children}
    </a>
  );
};

export const TextImportant = ({ children }) => {
  return <span styleName="important">{children}</span>;
};

export const TextBold = ({ children }) => {
  return <span styleName="bold">{children}</span>;
};
