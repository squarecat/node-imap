import './credits.module.scss';

import Modal, { ModalBody, ModalCloseIcon, ModalHeader } from '..';

import Button from '../../btn';
import React from 'react';

export default ({ shown = true, onClose, credits }) => {
  return (
    <Modal
      shown={shown}
      onClose={onClose}
      dismissable={false}
      style={{ width: 580 }}
    >
      <ModalCloseIcon />
      <ModalBody>
        <ModalHeader>Credit Balance</ModalHeader>
        <p>
          Your current credit balance is{' '}
          <span styleName="credit-balance">{credits}</span>
          <Button>Buy more</Button>
        </p>
        <h4>Invite friends and Earn Credit</h4>
        <p />
        {/* <div styleName="modal-actions" /> */}
      </ModalBody>
    </Modal>
  );
};
