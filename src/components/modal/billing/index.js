import '../modal.module.scss';

import { Elements, StripeProvider } from 'react-stripe-elements';
import React, { useEffect, useState } from 'react';

import CheckoutForm from './checkout-form';
import ModalClose from '../modal-close';
import { getPackage } from '../../../utils/prices';

// import { TextImportant } from '../text';
// import useUser from '../../utils/hooks/use-user';

function BillingModal({ onClose, packageId = '1', onPurchase }) {
  const [isShown, setShown] = useState(true);

  const packageDetails = getPackage(packageId);

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

  // const onClickRescan = async timeframe => {
  //   setShown(false);
  //   setTimeout(() => {
  //     return onRescan(timeframe);
  //   }, 300);
  // };

  // const onClickPurchase = async () => {
  //   setShown(false);
  //   setTimeout(() => {
  //     return onPurchase();
  //   }, 300);
  // };

  return (
    <>
      <Elements>
        <div styleName={`modal ${isShown ? 'shown' : ''}`}>
          <ModalClose onClose={onClickClose} />
          <h3>Buy Package</h3>
          <div styleName="modal-content">
            <p>
              Complete purchase of {packageDetails.unsubscriptions}{' '}
              unsubscriptions for ${packageDetails.price.toFixed(2) / 100}
            </p>
            {/* <CheckoutForm /> */}
          </div>
          {/* <div styleName="modal-actions">

          </div> */}
        </div>
        <div styleName={`modal-bg ${isShown ? 'shown' : ''}`} />
      </Elements>
    </>
  );
}

export default BillingModal;
