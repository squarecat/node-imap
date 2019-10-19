import { useContext, useEffect, useMemo, useState } from 'react';

import { DatabaseContext } from '../../../providers/db-provider';

export default function useMailItem(id, reducer) {
  const db = useContext(DatabaseContext);
  const [item, setItem] = useState({
    occurrences: []
  });

  useEffect(() => {
    function onUpdate(modifications, key, obj) {
      if (key === id) {
        let newItem = { ...obj, ...modifications };
        newItem = reducer ? reducer(newItem) : newItem;
        setTimeout(() => setItem(newItem), 0);
      }
    }

    async function get() {
      const value = await db.mail.get(id);
      const newItem = reducer ? reducer(value) : value;
      setItem(newItem);
    }

    db.mail.hook('updating', onUpdate);
    get();
    return () => {
      db.mail.hook('updating').unsubscribe(onUpdate);
    };
  }, [db.mail, id, reducer]);

  return useMemo(
    () => ({
      ...item,
      getLatest() {
        return item.occurrences[0] || {};
      },
      getPrevious(count) {
        return item.occurrences.filter(
          (it, index) => index !== 0 && index <= count
        );
      },
      toJSON() {
        return item;
      }
    }),
    [item]
  );
}
