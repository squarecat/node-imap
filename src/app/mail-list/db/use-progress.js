import { useContext, useEffect, useState } from 'react';

import { DatabaseContext } from '../../../providers/db-provider';
import _set from 'lodash.set';

function useProgress() {
  const db = useContext(DatabaseContext);
  const [state, setState] = useState({});

  useEffect(() => {
    function onCreate(key, obj) {
      setTimeout(() => {
        console.log('create progress', obj.value);
        if (key === 'progress') {
          setState(obj.value);
        }
      }, 0);
    }
    function onUpdate(modifications, key, obj) {
      setTimeout(() => {
        if (key === 'progress') {
          const k = Object.keys(modifications)[0];
          const v = modifications[k];
          const newObj = _set(obj, k, v);
          setState(newObj.value);
        }
      });
    }
    function onDelete(key) {
      setTimeout(() => {
        if (key === 'progress') {
          const newState = Object.keys(state).reduce(
            (k, o) => ({
              ...o,
              [k]: 0
            }),
            {}
          );
          setState(newState);
        }
      });
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
    db.prefs.hook('deleting', onDelete);
    get();

    return () => {
      db.prefs.hook('updating').unsubscribe(onUpdate);
      db.prefs.hook('creating').unsubscribe(onCreate);
      db.prefs.hook('deleting').unsubscribe(onDelete);
    };
  }, [state, db.prefs]);

  return state;
}

export default useProgress;
