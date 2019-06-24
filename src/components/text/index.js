import './text.module.scss';

import React from 'react';
import cx from 'classnames';
import { Link } from 'gatsby';

export const TextLink = ({
  children,
  smaller,
  undecorated,
  inverted,
  as,
  linkTo,
  ...props
}) => {
  const classes = cx('link', {
    smaller,
    undecorated,
    inverted
  });
  if (as === 'link' || linkTo) {
    return (
      <Link to={linkTo} styleName={classes}>
        {children}
      </Link>
    );
  }
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

export const TextFootnote = ({ children }) => {
  return <span styleName="footnote">{children}</span>;
};

export const TextLead = ({ prose, children }) => {
  if (prose) {
    return <p styleName="lead">{children}</p>;
  }
  return <span styleName="lead">{children}</span>;
};
