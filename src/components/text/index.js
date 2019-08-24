import { Link } from 'gatsby';
import React from 'react';
import cx from 'classnames';
import sa from '../../../plugins/simple-analytics-gatsby-plugin';
import styles from './text.module.scss';

export const TextLink = ({
  children,
  smaller,
  undecorated,
  inverted,
  as,
  event,
  linkTo,
  ...props
}) => {
  const classes = cx(styles.link, {
    [styles.smaller]: smaller,
    [styles.undecorated]: undecorated,
    [styles.inverted]: inverted
  });
  const onClick = () => {
    if (event) {
      sa(event);
    }
    return true;
  };

  if (as === 'link' || linkTo) {
    return (
      <Link
        to={linkTo}
        className={`${props.className} ${classes}`}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }
  return (
    <a className={`${props.className} ${classes}`} onClick={onClick} {...props}>
      {children}
    </a>
  );
};

export const TextImportant = ({ children, inverted }) => {
  const classes = cx('important', {
    inverted
  });
  return <span styleName={classes}>{children}</span>;
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

export const TextHighlight = ({ children }) => (
  <span styleName="highlight">{children}</span>
);

export const HeaderHighlight = ({ children }) => (
  <span styleName="header-highlight">{children}</span>
);
