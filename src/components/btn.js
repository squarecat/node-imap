import React from 'react';
import cx from 'classnames';

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
  className: cn
}) => {
  const className = cx(`btn ${cn}`, {
    loading,
    compact,
    centered,
    muted,
    icon,
    disabled,
    basic
  });
  return (
    <a className={className} onClick={onClick}>
      <span className="btn-content">{label || children}</span>
      {loading ? <span className="btn-loader" /> : null}
    </a>
  );
};
