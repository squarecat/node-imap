import { useContext, useEffect, useMemo, useState } from 'react';

import { DatabaseContext } from '../../../providers/db-provider';
import useUser from '../../../utils/hooks/use-user';

export default function useMailItem(id, reducer) {
  const db = useContext(DatabaseContext);
  const [item, setItem] = useState({
    occurrences: []
  });
  const isUnsubscribed = useUser(
    u => {
      if (item && u.unsubsciption) {
        return u.unsubsciptions.some(unsub => unsub.id === item.id);
      }
      return null;
    },
    [item]
  );

  useEffect(() => {
    // if this is a pending unsubscribe then check if
    // it already finished in the last render cycle
    // eg if the page was refreshed
    if (item && item.isLoading && !item.subscribed && isUnsubscribed) {
      db.mail.update(item.id, {
        isLoading: false
      });
    }
  }, [db.mail, isUnsubscribed, item]);

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
