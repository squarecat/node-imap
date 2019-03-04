import './toggle.module.scss';

import React, { useState } from 'react';

import cx from 'classnames';

export default ({ status, loading, disabled, onChange }) => {
  const [isOn, setStatus] = useState(status);
  // can only toggle off! Can't resubscribe
  const classes = cx('toggle', {
    on: isOn,
    off: !isOn,
    loading,
    disabled
  });
  return (
    <span
      styleName={classes}
      onClick={() => {
        if (disabled) return false;
        if (isOn) {
          setStatus(false);
          onChange(false);
        }
      }}
    >
      <span styleName="toggle-switch" />
      <span styleName="toggle-loader" />
    </span>
  );
};
