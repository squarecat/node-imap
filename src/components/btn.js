import React from 'react';
import cx from 'classnames';
import { Link } from 'gatsby';

import './btn.css';

export default ({
  loading,
  compact,
  onClick,
  muted,
  icon,
  disabled,
  children,
  label,
  basic,
  centered,
  linkTo,
  linkArgs = {},
  className: cn
}) => {
  const className = cx(`btn ${cn ? cn : ''}`, {
    loading,
    compact,
    centered,
    muted,
    icon,
    disabled,
    basic
  });
  if (linkTo) {
    return (
      <Link className={className} to={linkTo} state={linkArgs}>
        <span className="btn-content">{label || children}</span>
      </Link>
    );
  }
  return (
    <a className={className} onClick={onClick}>
      <span className="btn-content">{label || children}</span>
      {loading ? <span className="btn-loader" /> : null}
    </a>
  );
};
