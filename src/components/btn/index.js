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
  as,
  linkArgs = {},
  ...props
}) => {
  const classes = cx('btn', {
    loading,
    compact: props.compact,
    centered: props.centered,
    muted: props.muted,
    icon: props.icon,
    disabled: props.disabled,
    basic: props.basic,
    smaller: props.smaller,
    stretch: props.stretch,
    outlined: props.outlined,
    fill: props.fill,
    'on-dark-bg': props.onDarkBg
  });
  if (as === 'link' || linkTo) {
    return (
      <Link styleName={classes} to={linkTo} state={linkArgs}>
        <span styleName="btn-content">{label || children}</span>
      </Link>
    );
  }
  if (as === 'button') {
    return (
      <button styleName={classes} onClick={onClick} type="button" {...props}>
        <span styleName="btn-content">{label || children}</span>
        {loading ? <span styleName="btn-loader" /> : null}
      </button>
    );
  }
  return (
    <a styleName={classes} onClick={onClick}>
      <span styleName="btn-content">{label || children}</span>
      {loading ? <span styleName="btn-loader" /> : null}
    </a>
  );
};
