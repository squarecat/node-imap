import React, { useState } from 'react';
import './toggle.css';

export default ({ status, loading, onChange }) => {
  const [isOn, setStatus] = useState(status);
  // can only toggle off! Can't resubscribe
  return (
    <span
      className={`toggle ${isOn ? 'on' : 'off'} ${loading ? 'loading' : ''}`}
      onClick={() => {
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
