import React, { useState } from 'react';
import './toggle.css';

export default ({ status }) => {
  const [isOn, setStatus] = useState(status);
  return (
    <span className={`toggle ${isOn ? 'on' : 'off'}`}>
      <span className="toggle-switch" />
    </span>
  );
};
