import './modal.module.scss';

import React, { useEffect, useState } from 'react';

import ModalClose from './modal-close';

export default ({ onClose, onClickConfirm, content, confirmText }) => {
  const [isShown, setShown] = useState(false);

  const handleKeydown = e => {
    if (e.keyCode === 27 || e.key === 'Escape') {
      onClickClose();
    }
  };

  // on mount
  useEffect(() => {
    setShown(true);
    document.addEventListener('keydown', handleKeydown, false);
    return function cleanup() {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const onClickClose = () => {
    setShown(false);
    setTimeout(onClose, 300);
  };

  return (
    <>
      <div styleName={`modal ${isShown ? 'shown' : ''}`}>
        <ModalClose onClose={onClickClose} />
        <h3>Are you sure?</h3>
        <div styleName="modal-content">{content}</div>
        <div styleName="modal-actions">
          <a styleName="modal-btn modal-btn--secondary" onClick={onClickClose}>
            Cancel
          </a>
          <a styleName="modal-btn modal-btn--cta" onClick={onClickConfirm}>
            {confirmText}
          </a>
        </div>
      </div>
      <div styleName={`modal-bg ${isShown ? 'shown' : ''}`} />
    </>
  );
};
