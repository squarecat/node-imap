import { ModalBody, ModalCloseIcon, ModalHeader, ModalSaveAction } from '..';
import React, { useCallback, useContext, useState } from 'react';

import { ENTERPRISE } from '../../../../shared/prices';
import { FormCheckbox } from '../../form';
import { ModalContext } from '../../../providers/modal-provider';
import PlanImage from '../../pricing/plan-image';
import { TextImportant } from '../../text';
import request from '../../../utils/request';

export default () => {
  const { close: closeModal } = useContext(ModalContext);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const onClickConfirm = useCallback(async () => {
    try {
      setLoading(true);
      await enableTeam();
      setTimeout(() => {
        window.location.href = '/app/profile/team';
      }, 2000);
    } catch (err) {
      setLoading(false);
      console.error('error enabling teams', err);
    }
  }, []);

  return (
    <div style={{ width: 600, maxWidth: '100%' }}>
      <ModalBody compact>
        <ModalHeader>
          Get Started with Leave Me Alone for Teams
          <ModalCloseIcon />
        </ModalHeader>
        <p>
          Leave Me Alone for Teams lets your entire team keep their inbox clean
          so they can focus on building your business.
        </p>
        <p>
          <PlanImage smaller compact type="enterprise" />
        </p>
        <p style={{ textAlign: 'center', fontSize: '16px' }}>
          <TextImportant>Unlimited unsubscribes</TextImportant> for{' '}
          <TextImportant>
            ${(ENTERPRISE.pricePerSeat / 100).toFixed(2)}
          </TextImportant>{' '}
          per seat/month
        </p>
        <p>
          <TextImportant>PLEASE READ:</TextImportant>
          This account will become the admin account for your team. Your
          connected accounts will be removed and you will need to activate your
          team by adding a payment method before you can start unsubscribing.
        </p>
        <p>Confirm this change to start setting up your new team account!</p>
        <FormCheckbox
          onChange={e => {
            const { checked } = e.currentTarget;
            setConfirmed(checked);
            e.stopPropagation();
          }}
          checked={confirmed}
          label={`Yes I want to switch this account to Teams`}
        />
      </ModalBody>
      <ModalSaveAction
        onSave={onClickConfirm}
        onCancel={closeModal}
        saveText="Yes! Take me to my team account"
        isLoading={loading}
        isDisabled={!confirmed}
      />
    </div>
  );
};

function enableTeam() {
  return request('/api/me', {
    method: 'PATCH',
    body: JSON.stringify({ op: 'enable-team' })
  });
}
