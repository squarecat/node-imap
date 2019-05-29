import { useEffect, useState } from 'react';

import db from './';

export default function useMailItem(id, reducer = v => v) {
  const [item, setItem] = useState({});
  function onUpdate(modifications, key, obj) {
    if (key === id) {
      const newItem = { ...obj, ...modifications };
      setItem(reducer(newItem));
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
