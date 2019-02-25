import './btn.module.scss';

import { Link } from 'gatsby';
import React from 'react';
import cx from 'classnames';

export default ({
  loading,
  onClick,
  children,
  label,
  linkTo,
  linkArgs = {},
  ...visProps
}) => {
  const classes = cx('btn', {
    loading: visProps.loading,
    compact: visProps.compact,
    centered: visProps.centered,
    muted: visProps.muted,
    icon: visProps.icon,
    disabled: visProps.disabled,
    basic: visProps.basic,
    smaller: visProps.smaller,
    stretch: visProps.stretch,
    'on-dark-bg': visProps.onDarkBg
  });
  if (linkTo) {
    return (
      <Link styleName={classes} to={linkTo} state={linkArgs}>
        <span className="btn-content">{label || children}</span>
      </Link>
    );
  }
  return (
    <a styleName={classes} onClick={onClick}>
      <span className="btn-content">{label || children}</span>
      {loading ? <span className="btn-loader" /> : null}
    </a>
  );
};
