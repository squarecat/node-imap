import React, { useState } from 'react';
import cx from 'classnames';

import './toggle.css';

export default ({ status, loading, disabled, onChange }) => {
  const [isOn, setStatus] = useState(status);
  // can only toggle off! Can't resubscribe
  return (
    <span
      className={cx('toggle', {
        on: isOn,
        off: !isOn,
        loading,
        disabled
      })}
      onClick={() => {
        if (disabled) return false;
        if (isOn) {
          setStatus(false);
          onChange(false);
        }
      }}
    >
      <span className="toggle-switch" />
      <span className="toggle-loader" />
    </span>
  );
};
