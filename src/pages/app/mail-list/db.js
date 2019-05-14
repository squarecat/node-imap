import React, { createContext } from 'react';

const MailContext = createContext(null);

export default ({ children }) => {
  return (
    <MailContext.Provider value={{ mail: [], refresh: () => {} }}>
      {children}
    </MailContext.Provider>
  );
};
