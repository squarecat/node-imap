import './modal.module.scss';

import React, { useEffect, useState } from 'react';

import Button from '../btn';
import ModalClose from './modal-close';
import TwoFactorInput from '../2fa';

export default ({ onClose }) => {
  const [isShown, setShown] = useState(false);
  const [isVerified, setVerified] = useState(null);
  const onClickClose = () => {
    setShown(false);
    setTimeout(() => onClose({ verified: isVerified }), 300);
  };
  const [isLoading, setLoading] = useState(false);

  useEffect(
    () => {
      if (isVerified) {
        onClickClose();
      }
    },
    [isVerified]
  );

  useEffect(() => {
    setShown(true);
  });

  return (
    <>
      <div styleName={`modal ${isShown ? 'shown' : ''}`}>
        <ModalClose onClose={onClickClose} />
        <h3>Two-factor Auth Required</h3>
        <div styleName="modal-content">
          <p>This action requires authentication.</p>
          <p>
            Open your authentication app and enter the code for Leave Me Alone.
          </p>
          <TwoFactorInput
            onComplete={isVer => setVerified(isVer)}
            onLoading={is2faLoading => setLoading(is2faLoading)}
          />
          {isVerified === false ? (
            <p>
              Verification failed. Please check you have entered the correct
              code
            </p>
          ) : null}
          <div styleName="modal-buttons">
            <a
              styleName="modal-btn modal-btn--secondary modal-btn--cancel"
              onClick={onClickClose}
            >
              Cancel
            </a>
            <Button
              compact
              loading={isLoading}
              disabled={!isVerified}
              onClick={() => onClose({ verified: isVerified })}
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
      <div styleName={`modal-bg ${isShown ? 'shown' : ''}`} />
    </>
  );
};
