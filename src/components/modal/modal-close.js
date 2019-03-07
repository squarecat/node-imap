import './modal-close.module.scss';

import { CloseIcon } from '../icons';
import React from 'react';

export default ({ onClose }) => (
  <a styleName="modal-close-btn" onClick={onClose}>
    <CloseIcon />
  </a>
);
