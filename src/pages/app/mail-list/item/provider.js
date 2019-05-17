import React, { createContext, useEffect, useMemo, useState } from 'react';

import db from '../db';

export const MailItemContext = createContext({});

export function MailItemProvider({ id, children }) {
  const [item, setItem] = useState({});

  async function fetchItem() {
    console.log('fetching', id, 'from db');
    const value = await db.mail.get(id);
    setItem(value);
  }

  function update(modifications, key, obj) {
    // the details of this mail item have changed
    setItem(obj);
  }

  useEffect(
    () => {
      fetchItem();
    },
    [id]
  );

  useEffect(() => {
    db.mail.hook('updating').unsubscribe(update);
  }, []);

  return (
    <MailItemContext.Provider value={item}>{children}</MailItemContext.Provider>
  );
}
