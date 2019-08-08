import './imap.module.scss';

import { ModalBody, ModalCloseIcon, ModalHeader, ModalSaveAction } from '..';
import React, { useContext } from 'react';

import ImapForm from '../../imap';
import { ModalContext } from '../../../providers/modal-provider';
import { openChat } from '../../../utils/chat';
import useUser from '../../../utils/hooks/use-user';

export default ({ onConfirm = () => {} }) => {
  const { close: closeModal } = useContext(ModalContext);
  const [isImapEnabled] = useUser(u => u.loginProvider === 'password');

  return (
    <div styleName="imap-modal">
      <ModalBody compact>
        <ModalHeader>
          IMAP Setup
          <ModalCloseIcon />
        </ModalHeader>
        <ImapForm
          onConfirm={() => {
            closeModal();
            onConfirm();
          }}
          actions={state => {
            return isImapEnabled ? (
              <ModalSaveAction
                onCancel={closeModal}
                saveText={'Save'}
                isDisabled={state.loading}
                isLoading={state.loading}
              />
            ) : (
              <ModalSaveAction
                onSave={() => {
                  openChat();
                }}
                onCancel={closeModal}
                saveText="Contact Us"
              />
            );
          }}
        />
      </ModalBody>
    </div>
  );
};
