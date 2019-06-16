import './range.module.scss';

import React from 'react';

export default ({ onChange, label, min, max, ...props }) => {
  return (
    <span styleName="range-input">
      {label ? <span styleName="label">{label}</span> : null}
      <input
        type="range"
        min={min}
        max={max}
        onChange={({ currentTarget }) => onChange(currentTarget.value)}
        {...props}
      />
    </span>
  );
};
