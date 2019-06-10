import Modal, {
  ModalBody,
  ModalCloseIcon,
  ModalHeader,
  ModalSaveAction
} from './';

import React from 'react';

export default ({ shown, onClose, onConfirm, content, confirmText }) => {
  return (
    <Modal
      shown={shown}
      onClose={onClose}
      dismissable={false}
      style={{ width: 580 }}
    >
      <ModalCloseIcon />
      <ModalBody>
        <ModalHeader>Are you sure?</ModalHeader>
        {content}
      </ModalBody>
      <ModalSaveAction
        onSave={onConfirm}
        onCancel={onClose}
        saveText={confirmText}
      />
    </Modal>
  );
};
