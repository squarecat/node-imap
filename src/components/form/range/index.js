import './range.module.scss';

import React from 'react';

export default ({ onChange, ...props }) => {
  return (
    <input
      type="range"
      onChange={({ currentTarget }) => onChange(currentTarget.value)}
      {...props}
    />
  );
};
