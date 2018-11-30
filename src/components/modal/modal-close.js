import React from 'react';

import './modal-close.css';

export default ({ onClose }) => (
  <a className="modal-close-btn" onClick={onClose}>
    <svg
      id="i-close"
      viewBox="0 0 32 32"
      width="16"
      height="16"
      fill="none"
      stroke="currentcolor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 30 L30 2 M30 30 L2 2" />
    </svg>
  </a>
);
