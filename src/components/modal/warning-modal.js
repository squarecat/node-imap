import { ModalBody, ModalCloseIcon, ModalHeader, ModalSaveAction } from './';
import React, { useContext } from 'react';

import { ModalContext } from '../../providers/modal-provider';

export default ({
  onConfirm,
  autoClose = true,
  content,
  confirmText,
  headerText = 'Are you sure?',
  loading
}) => {
  const { close: closeModal } = useContext(ModalContext);
  return (
    <div style={{ width: 600, maxWidth: '100%' }}>
      <ModalBody compact>
        <ModalHeader>
          {headerText}
          <ModalCloseIcon />
        </ModalHeader>
        {content}
      </ModalBody>
      <ModalSaveAction
        onSave={() => {
          if (autoClose) closeModal();
          onConfirm();
        }}
        onCancel={closeModal}
        saveText={confirmText}
        isLoading={loading}
      />
    </div>
  );
};
