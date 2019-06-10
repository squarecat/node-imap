import './modal.module.scss';

import React, { useCallback, useEffect, useState } from 'react';

import Button from '../btn';
import ModalClose from './modal-close';
import TwoFactorInput from '../2fa';

export default ({ onClose, action }) => {
  const [isShown, setShown] = useState(false);
  const [{ isVerified, token }, setVerified] = useState({});

  const [isLoading, setLoading] = useState(false);

  const onClickClose = useCallback(
    async () => {
      try {
        if (action && isVerified) {
          await action(token);
        }
        setShown(false);
        setTimeout(() => onClose({ verified: isVerified }), 300);
      } catch (err) {
        setVerified({ isVerified: false });
      }
    },
    [action, isVerified, onClose, token]
  );

  useEffect(
    () => {
      if (isVerified) {
        onClickClose();
      }
    },
    [isVerified, onClickClose]
  );

  useEffect(() => {
    setShown(true);
  }, []);

  return (
    <>
      <div styleName={`modal ${isShown ? 'shown' : ''}`}>
        <ModalClose onClose={onClose} />
        <h3>Two-factor Auth Required</h3>
        <div styleName="modal-content">
          <p>This action requires authentication.</p>
          <p>
            Open your authentication app and enter the code for Leave Me Alone.
          </p>
          <TwoFactorInput
            action={action}
            onComplete={(isVer, { token }) =>
              setVerified({ isVerified: isVer, token })
            }
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
