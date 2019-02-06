import React, { useState, useEffect } from 'react';

import ModalClose from './modal/modal-close';

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
      <div className={`modal warning-modal ${isShown ? 'shown' : ''}`}>
        <ModalClose onClose={onClickClose} />
        <h3>Are you sure?</h3>
        <div className="modal-content">{content}</div>
        <div className="modal-actions">
          <a className="btn compact" onClick={onClickClose}>
            Cancel
          </a>
          <a className="btn compact" onClick={onClickConfirm}>
            {confirmText}
          </a>
        </div>
      </div>
      <div className={`modal-bg ${isShown ? 'shown' : ''}`} />
    </>
  );
};
