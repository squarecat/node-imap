import './modal.module.scss';

import React, { useEffect, useState } from 'react';

import ModalClose from './modal-close';
import { TextImportant } from '../text';
import useUser from '../../utils/hooks/use-user';

const tfToString = {
  '3d': '3 day scan',
  '1w': '1 week scan',
  '1m': '1 month scan',
  '6m': '6 month scan'
};

export default ({ onClose, onRescan, onPurchase }) => {
  const [lastScan] = useUser(u => u.lastScan);
  const [isShown, setShown] = useState(false);

  const handleKeydown = e => {
    if (e.keyCode === 27 || e.key === 'Escape') {
      onClickClose();
    }
  };

  // on mount
  useEffect(() => {
    setShown(true);
    document.addEventListener('keydown', handleKeydown, false);
    return function cleanup() {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const onClickClose = () => {
    setShown(false);
    setTimeout(onClose, 300);
  };

  const onClickRescan = async timeframe => {
    setShown(false);
    setTimeout(() => {
      return onRescan(timeframe);
    }, 300);
  };
  const onClickPurchase = async () => {
    setShown(false);
    setTimeout(() => {
      return onPurchase();
    }, 300);
  };

  return (
    <>
      <div styleName={`modal ${isShown ? 'shown' : ''}`}>
        <ModalClose onClose={onClickClose} />
        <h3>Scan purchased in the last 24 hours</h3>
        <div styleName="modal-content">
          <p>Are you sure you want to purchase another scan?</p>
          <p>
            You purchased a{' '}
            <TextImportant>{tfToString[lastScan.timeframe]}</TextImportant>{' '}
            recently which you can run again for up to 24 hours after purchase.
          </p>
        </div>
        <div styleName="modal-actions">
          <a
            styleName="modal-btn modal-btn--secondary"
            onClick={() => onClickPurchase()}
          >
            Purchase another scan
          </a>
          <a
            styleName="modal-btn modal-btn--cta"
            onClick={() => onClickRescan(lastScan.timeframe)}
          >
            Re-run my last scan
          </a>
        </div>
      </div>
      <div styleName={`modal-bg ${isShown ? 'shown' : ''}`} />
    </>
  );
};
