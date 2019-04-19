import '../modal.module.scss';

import React, { useEffect, useState } from 'react';

import ConnectAccounts from './connect-accounts';

export default ({ onClose }) => {
  const [isShown, setShown] = useState(false);
  const onClickClose = () => {
    setShown(false);
    setTimeout(onClose, 300);
  };

  // on mount
  useEffect(() => {
    setShown(true);
  }, []);

  return (
    <>
      <div styleName={`modal ${isShown ? 'shown' : ''}`} />
      <div styleName={`modal-bg ${isShown ? 'shown' : ''}`} />
    </>
  );
};
