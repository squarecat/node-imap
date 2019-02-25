import './text.module.scss';

import React from 'react';

export const TextLink = ({ children, ...props }) => {
  return (
    <a styleName="link" {...props}>
      {children}
    </a>
  );
};

export const TextImportant = ({ children }) => {
  return <a styleName="important">{children}</a>;
};
