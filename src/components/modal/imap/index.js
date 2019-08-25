import './imap-modal.module.scss';

import { AolIcon, FastmailIcon, ICloudIcon, YahooIcon } from '../../icons';
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
      const icon = getIcon(providerType);
      const label = CONFIG[providerType].imap.displayName;
      return (
        <span styleName="title-with-icon">
          <span styleName="icon">{icon}</span>
          <span styleName="text">Connect {label} account</span>
        </span>
      );
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

function getIcon(providerType) {
  if (providerType === 'yahoo') {
    return <YahooIcon width="16" height="16" />;
  }
  if (providerType === 'icloud') {
    return <ICloudIcon />;
  }
  if (providerType === 'fastmail') {
    return <FastmailIcon />;
  }
  if (providerType === 'aol') {
    return <AolIcon width="16" height="16" />;
  }
  return null;
}
