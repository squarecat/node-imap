import './team-switch.module.scss';

import { ENTERPRISE, getViewPrice } from '../../../../shared/prices';
import { ModalBody, ModalCloseIcon, ModalHeader, ModalSaveAction } from '..';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { FormCheckbox } from '../../form';
import { ModalContext } from '../../../providers/modal-provider';
import PlanImage from '../../pricing/plan-image';
import { TextImportant } from '../../text';
import request from '../../../utils/request';
import useMedia from 'react-use/lib/useMedia';

export default () => {
  const { close: closeModal } = useContext(ModalContext);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const isMobile = useMedia('(max-width: 500px)');

  const btnText = useMemo(() => {
    if (isMobile) return 'Get Teams!';
    return 'Yes! Take me to my team account';
  }, [isMobile]);

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
        <p styleName="info">
          <TextImportant>Unlimited unsubscribes</TextImportant> for{' '}
          <TextImportant>
            ${getViewPrice(ENTERPRISE.basePrice)}/mo
          </TextImportant>{' '}
          + ${getViewPrice(ENTERPRISE.pricePerSeat)} per seat
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
        saveText={btnText}
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
