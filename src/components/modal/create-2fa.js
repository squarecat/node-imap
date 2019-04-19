import './modal.module.scss';

import React, { useEffect, useState } from 'react';

import Button from '../btn';
import ModalClose from './modal-close';
import TwoFactorInput from '../2fa';
import { useAsync } from 'react-use';

export default ({ onClose }) => {
  const [isShown, setShown] = useState(false);
  const [isVerified, setVerified] = useState(null);
  const onClickClose = () => {
    setShown(false);
    setTimeout(() => onClose({ verified: isVerified }), 300);
  };
  const [isLoading, setLoading] = useState(false);
  const { value, loading } = useAsync(fetchTotpData);
  const [method, setMethod] = useState('qr');

  if (loading) return null;
  const { qrData, base32 } = value;

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
        <h3>Setup Two-factor Authentication</h3>
        <div styleName="modal-content">
          <p>Secure your account by setting up two-factor authentication.</p>
          <p>
            Scan the image below with the two-factor authentication app on your
            phone. If you can’t use a barcode,{' '}
            <a onClick={() => setMethod('code')}>enter this text code</a>{' '}
            instead.
          </p>
          {method === 'qr' ? (
            <div>
              <img src={qrData} alt="2fa qr code" />
            </div>
          ) : (
            <div>
              <span>{base32}</span>
            </div>
          )}
          <p>
            After scanning the barcode image, the app will display a six-digit
            code that you can enter below.
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

async function fetchTotpData() {
  const res = await fetch('/api/user/me/2fa/setup');
  return res.json();
}
