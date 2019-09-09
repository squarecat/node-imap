import { useContext, useEffect, useState } from 'react';

import { DatabaseContext } from '../../../providers/db-provider';

function useProgress() {
  const db = useContext(DatabaseContext);
  const [state, setState] = useState({});

  useEffect(() => {
    function onCreate(key, obj) {
      setTimeout(() => {
        if (key === 'progress') {
          setState(obj.value);
        }
      }, 0);
    }
    function onUpdate(modifications, key, obj) {
      setTimeout(() => {
        if (key === 'progress') {
          setState(obj.value);
        }
      }, 0);
    }
    async function get() {
      setTimeout(async () => {
        const p = await db.prefs.get('progress');
        if (!p) return;
        const { value } = p;
        if (
          Object.keys(value)
            .sort()
            .toString() !==
          Object.keys(state)
            .sort()
            .toString()
        ) {
          setState(value);
        }
      }, 0);
    }
    db.prefs.hook('updating', onUpdate);
    db.prefs.hook('creating', onCreate);
    get();

    return () => {
      db.prefs.hook('updating').unsubscribe(onUpdate);
      db.prefs.hook('creating').unsubscribe(onCreate);
    };
  }, [state, db.prefs]);

  return state;
}
export default useProgress;
