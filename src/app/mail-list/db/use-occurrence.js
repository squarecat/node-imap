import { useContext, useEffect, useRef, useState } from 'react';

import { DatabaseContext } from '../../../providers/db-provider';

function useOccurrence({ fromEmail, toEmail }) {
  const db = useContext(DatabaseContext);
  const [count, setCount] = useState({});
  const dupeKey = `<${fromEmail}>-${toEmail}`;

  useEffect(() => {
    function onCreate(key, obj) {
      setTimeout(() => {
        if (dupeKey === key) {
          setCount(obj);
        }
      }, 0);
    }
    function onUpdate(modifications, key, obj) {
      setTimeout(() => {
        if (dupeKey === key && obj.count !== count.count) {
          setCount(obj);
        }
      }, 0);
    }
    async function get() {
      setTimeout(async () => {
        const value = await db.occurrences.get(dupeKey);
        if (value && value.count !== count.count) {
          setCount(value);
        }
      }, 0);
    }
    db.occurrences.hook('updating', onUpdate);
    db.occurrences.hook('creating', onCreate);
    get();

    return () => {
      db.occurrences.hook('updating').unsubscribe(onUpdate);
      db.occurrences.hook('creating').unsubscribe(onCreate);
    };
  }, [count, db.occurrences, dupeKey]);

  return count;
}
export default useOccurrence;
