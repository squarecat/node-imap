import { ModalBody, ModalHeader } from './';

import React from 'react';

export default ({ children }) => {
  return (
    <div style={{ width: 600, maxWidth: '100%' }}>
      <ModalBody compact>
        <ModalHeader>Browser not supported</ModalHeader>
        {children}
      </ModalBody>
    </div>
  );
};
