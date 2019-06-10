import './btn.module.scss';

import { Link } from 'gatsby';
import React from 'react';
import _omit from 'lodash.omit';
import cx from 'classnames';

const styleProps = [
  'loading',
  'compact',
  'centered',
  'muted',
  'icon',
  'disabled',
  'basic',
  'smaller',
  'stretch',
  'outlined',
  'fill',
  'onDarkBg'
];

export default ({
  loading,
  onClick,
  children,
  label,
  linkTo,
  as,
  linkArgs = {},
  disabled = false,
  inline = false,
  ...props
}) => {
  const classes = cx('btn', {
    loading,
    inline,
    compact: props.compact,
    centered: props.centered,
    muted: props.muted,
    icon: props.icon,
    disabled,
    basic: props.basic,
    smaller: props.smaller,
    stretch: props.stretch,
    outlined: props.outlined,
    fill: props.fill,
    'on-dark-bg': props.onDarkBg
  });

  let elProps = _omit(props, styleProps);
  if (disabled) {
    elProps = { ...elProps, disabled };
  }
  if (as === 'link' || linkTo) {
    return (
      <Link styleName={classes} to={linkTo} state={linkArgs}>
        <span styleName="btn-content">{label || children}</span>
      </Link>
    );
  }
  if (as === 'button') {
    return (
      <button styleName={classes} onClick={onClick} type="button" {...elProps}>
        <span styleName="btn-content">{label || children}</span>
        {loading ? <span styleName="btn-loader" /> : null}
      </button>
    );
  }
  return (
    <a styleName={classes} onClick={onClick} {...elProps}>
      <span styleName="btn-content">{label || children}</span>
      {loading ? <span styleName="btn-loader" /> : null}
    </a>
  );
};
