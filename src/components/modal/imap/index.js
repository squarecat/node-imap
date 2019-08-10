import './imap.module.scss';

import ImapForm, { CONFIG } from '../../imap';
import { ModalBody, ModalCloseIcon, ModalHeader, ModalSaveAction } from '..';
import React, { useContext, useMemo } from 'react';

import { ModalContext } from '../../../providers/modal-provider';
import { openChat } from '../../../utils/chat';
import useUser from '../../../utils/hooks/use-user';

export default ({ onConfirm = () => {}, providerType }) => {
  const { close: closeModal } = useContext(ModalContext);
  const [isImapEnabled] = useUser(u => u.loginProvider === 'password');

  const title = useMemo(
    () => {
      if (!providerType) return 'Connect IMAP account';
      const label = CONFIG[providerType].label;
      return `Connect ${label} account`;
    },
    [providerType]
  );

  return (
    <div styleName="imap-modal">
      <ModalBody compact>
        <ModalHeader>
          {title}
          <ModalCloseIcon />
        </ModalHeader>
        <ImapForm
          onConfirm={() => {
            closeModal();
            onConfirm();
          }}
          providerType={providerType}
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
