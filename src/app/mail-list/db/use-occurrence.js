import { useContext, useEffect, useRef, useState } from 'react';

import { DatabaseContext } from '../../../providers/db-provider';

export default function useOccurrence({
  fromEmail,
  toEmail,
  withLastSeen = false
}) {
  const db = useContext(DatabaseContext);
  const [count, setCount] = useState(withLastSeen ? {} : 0);
  const dupeKey = `<${fromEmail}>-${toEmail}`;
  const fetched = useRef(null);

  useEffect(
    () => {
      function onCreate(key, obj) {
        setTimeout(() => {
          if (dupeKey === key) {
            setCount(withLastSeen ? obj : obj.count);
          }
        }, 0);
      }
      function onUpdate(modifications, key, obj) {
        setTimeout(() => {
          if (dupeKey === key) {
            if (withLastSeen) {
              setCount(obj);
            } else {
              setCount(modifications.count);
            }
          }
        }, 0);
      }
      async function get() {
        setTimeout(async () => {
          const value = await db.occurrences.get(dupeKey);
          if (value) {
            setCount(withLastSeen ? value : value.count);
          }
          fetched.current = true;
        }, 0);
      }
      db.occurrences.hook('updating', onUpdate);
      db.occurrences.hook('creating', onCreate);
      if (!fetched.current) {
        get();
      }
      return () => {
        db.occurrences.hook('updating').unsubscribe(onUpdate);
        db.occurrences.hook('creating').unsubscribe(onCreate);
      };
    },
    [count, db.occurrences, dupeKey, withLastSeen]
  );

  return count;
}
