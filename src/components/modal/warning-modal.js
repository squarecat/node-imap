import { ModalBody, ModalCloseIcon, ModalHeader, ModalSaveAction } from './';
import React, { useContext } from 'react';

import { ModalContext } from '../../providers/modal-provider';

export default ({ onConfirm, content, confirmText }) => {
  const { close: closeModal } = useContext(ModalContext);
  return (
    <div style={{ width: 600, maxWidth: '100%' }}>
      <ModalBody compact>
        <ModalHeader>
          Are you sure?
          <ModalCloseIcon />
        </ModalHeader>
        {content}
      </ModalBody>
      <ModalSaveAction
        onSave={() => {
          closeModal();
          onConfirm();
        }}
        onCancel={closeModal}
        saveText={confirmText}
      />
    </div>
  );
};
