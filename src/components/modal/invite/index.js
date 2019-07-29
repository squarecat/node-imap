import './invite-modal.module.scss';

import { ModalBody, ModalHeader, ModalSaveAction } from '..';
import React, { useContext, useMemo } from 'react';

import { ModalContext } from '../../../providers/modal-provider';

export default ({ emails, onConfirm }) => {
  const { close: closeModal } = useContext(ModalContext);
  const content = useMemo(
    () => {
      if (!emails.length) {
        return (
          <>
            <p>
              Oops! We couldn't find any email addresses in the text you
              provided.
            </p>
            <p>
              Please check the entries are comma separated and contain at least
              one @ and one period.
            </p>
          </>
        );
      }
      return (
        <>
          <p>
            Invites to your team will be sent to the following email addresses:
          </p>
          <ul styleName="list">
            {emails.map(email => (
              <li key={email}>
                <span styleName="email">{email}</span>
              </li>
            ))}
          </ul>
        </>
      );
    },
    [emails]
  );

  return (
    <div styleName="invite-modal">
      <ModalBody compact>
        <ModalHeader>Confirm Team Invites</ModalHeader>
        {content}
      </ModalBody>
      <ModalSaveAction
        onSave={() => {
          closeModal();
          onConfirm();
        }}
        isDisabled={!emails.length}
        onCancel={closeModal}
        saveText="Confirm"
      />
    </div>
  );
};
