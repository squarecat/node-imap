import { useContext, useEffect, useState } from 'react';

import { DatabaseContext } from '../../db-provider';

export default function useOccurrence({ fromEmail, toEmail }) {
  const db = useContext(DatabaseContext);
  const [count, setCount] = useState(0);
  const dupeKey = `<${fromEmail}>-${toEmail}`;
  function onCreate(key, obj) {
    setTimeout(() => {
      if (dupeKey === key) {
        setCount(obj.count);
      }
    }, 0);
  }
  function onUpdate(modifications, key) {
    setTimeout(() => {
      if (dupeKey === key) {
        setCount(modifications.count);
      }
    }, 0);
  }
  async function get() {
    setTimeout(async () => {
      const value = await db.occurrences.get(dupeKey);
      if (value) {
        setCount(value.count);
      }
    }, 0);
  }
  useEffect(() => {
    db.occurrences.hook('updating', onUpdate);
    db.occurrences.hook('creating', onCreate);
    get();
    return () => {
      db.occurrences.hook('updating').unsubscribe(onUpdate);
      db.occurrences.hook('creating').unsubscribe(onCreate);
    };
  }, []);
  return count;
}
