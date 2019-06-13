import { useContext, useEffect, useState } from 'react';

import { DatabaseContext } from '../../../providers/db-provider';

export default function useMailItem(id, reducer = v => v) {
  const db = useContext(DatabaseContext);
  const [item, setItem] = useState({});

  function onUpdate(modifications, key, obj) {
    if (key === id) {
      const newItem = { ...obj, ...modifications };
      setTimeout(() => setItem(reducer(newItem)), 0);
    }
  }

  async function get() {
    const value = await db.mail.get(id);
    setItem(reducer(value));
  }
  useEffect(
    () => {
      db.mail.hook('updating', onUpdate);
      get();
      return () => {
        db.mail.hook('updating').unsubscribe(onUpdate);
      };
    },
    [id]
  );
  return item;
}
