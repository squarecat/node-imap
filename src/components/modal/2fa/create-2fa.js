import './2fa.module.scss';

import { ModalBody, ModalFooter, ModalHeader } from '..';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import Button from '../../btn';
import { ModalContext } from '../../../providers/modal-provider';
import TwoFactorInput from '../../2fa';
import request from '../../../utils/request';
import useAsync from 'react-use/lib/useAsync';

export default () => {
  const { close } = useContext(ModalContext);
  const [isVerified, setVerified] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [method, setMethod] = useState('qr');
  const onClickClose = useCallback(
    () => {
      close({ verified: isVerified });
    },
    [close, isVerified]
  );
  const { value, loading, error } = useAsync(fetchTotpData);

  useEffect(
    () => {
      if (isVerified) {
        onClickClose();
      }
    },
    [isVerified, onClickClose]
  );

  const content = useMemo(
    () => {
      if (loading || error) return null;
      const { qrData, base32 } = value;
      return (
        <>
          <ModalBody compact>
            <ModalHeader>Setup Two-factor Authentication</ModalHeader>
            <p>Secure your account by setting up two-factor authentication.</p>
            <p>
              Scan the image below with the two-factor authentication app on
              your phone. If you can’t use a barcode,{' '}
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
              <div styleName="error">
                <p>
                  Verification failed. Please check you have entered the correct
                  code
                </p>
              </div>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button
              compact
              muted
              outlined
              basic
              onClick={() => close({ verified: false })}
            >
              Cancel
            </Button>
            <Button
              compact
              basic
              loading={isLoading}
              disabled={!isVerified}
              onClick={() => close({ verified: isVerified })}
            >
              Confirm
            </Button>
          </ModalFooter>
        </>
      );
    },
    [close, isLoading, isVerified, loading, method, value]
  );

  return content;
};

async function fetchTotpData() {
  return request('/api/user/me/2fa/setup');
}
