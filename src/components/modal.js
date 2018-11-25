import React from 'react';
import './modal.css';

export default ({ onClose, children }) => {
  return <div className="modal">{children}</div>;
};
