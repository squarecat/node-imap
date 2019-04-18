import React, { useEffect, useState } from 'react';

import Create2FA from './create-2fa';
import ModalClose from '../modal-close';

export default ({ onClose }) => {
  const [isShown, setShown] = useState(false);
  const content = <Create2FA />;
  const onClickClose = () => {
    setShown(false);
    setTimeout(onClose, 300);
  };
  return (
    <>
      <div styleName={`modal ${isShown ? 'shown' : ''}`}>
        <ModalClose onClose={onClickClose} />
        {content}
      </div>
      <div styleName={`modal-bg ${isShown ? 'shown' : ''}`} />
    </>
  );
};
