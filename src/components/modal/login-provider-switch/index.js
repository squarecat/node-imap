import { ModalBody, ModalCloseIcon, ModalHeader, ModalSaveAction } from '..';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { FormCheckbox } from '../../form';
import { ModalContext } from '../../../providers/modal-provider';
import { TextImportant } from '../../text';
import request from '../../../utils/request';
import useMedia from 'react-use/lib/useMedia';
import useUser from '../../../utils/hooks/use-user';

export default () => {
  const { close: closeModal } = useContext(ModalContext);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const isMobile = useMedia('(max-width: 500px)');

  const [email] = useUser(u => u.email);

  const btnText = useMemo(() => {
    if (isMobile) return 'Confirm!';
    return 'Yes! Switch my account to password';
  }, [isMobile]);

  const onClickConfirm = useCallback(async () => {
    try {
      setLoading(true);
      await switchLoginToPassword();
      setTimeout(() => {
        window.location.href = `/login?strategy=reset&username=${email}`;
      }, 2000);
    } catch (err) {
      setLoading(false);
      console.error('error switching to password', err);
    }
  }, [email]);

  return (
    <div style={{ width: 600, maxWidth: '100%' }}>
      <ModalBody compact>
        <ModalHeader>
          Switch to password log in
          <ModalCloseIcon />
        </ModalHeader>
        <p>This will switch your account to log in with password.</p>
        <p>
          You will be logged out, and prompted to{' '}
          <TextImportant>
            reset your password using the code we emailed to you
          </TextImportant>
          .
        </p>
        <FormCheckbox
          onChange={e => {
            const { checked } = e.currentTarget;
            setConfirmed(checked);
            e.stopPropagation();
          }}
          checked={confirmed}
          label={`I want to switch this account to password log in`}
        />
      </ModalBody>
      <ModalSaveAction
        onSave={onClickConfirm}
        onCancel={closeModal}
        saveText={btnText}
        isLoading={loading}
        isDisabled={!confirmed}
      />
    </div>
  );
};

function switchLoginToPassword() {
  return request('/api/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ op: 'set-password-login' })
  });
}
