import { useEffect, useState } from 'react';

import db from './';

export default function useOccurrence({ fromEmail, toEmail }) {
  const [count, setCount] = useState(0);
  const dupeKey = `<${fromEmail}>-${toEmail}`;
  function onCreate(key, obj) {
    if (dupeKey === key) {
      setCount(obj.count);
    }
  }
  function onUpdate(modifications, key) {
    if (dupeKey === key) {
      setCount(modifications.count);
    }
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
