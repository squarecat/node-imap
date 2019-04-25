import React, { createContext, useState } from 'react';

import ModalClose from './modal-close';

export const ModalContext = createContext({ isShown: true });

export default ({ onClose, children }) => {
  const [isShown, setShown] = useState(true);
  const onClickClose = () => {
    setShown(false);
    setTimeout(onClose, 300);
  };
  return (
    <>
      <ModalContext.Provider value={{ isShown, setShown }}>
        <div styleName={`modal ${isShown ? 'shown' : ''}`}>
          <ModalClose onClose={onClickClose} />
          {children}
        </div>
        <div styleName={`modal-bg ${isShown ? 'shown' : ''}`} />
      </ModalContext.Provider>
    </>
  );
};
