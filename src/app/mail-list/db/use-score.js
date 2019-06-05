import { useContext, useEffect, useState } from 'react';

import { DatabaseContext } from '../../db-provider';

export default function useScore(address) {
  const db = useContext(DatabaseContext);
  const [score, setScore] = useState('unknown');
  function onUpdate(modifications, key, obj) {
    if (key === address) {
      const newItem = { ...obj, ...modifications };
      setTimeout(() => {
        setScore({
          score: newItem.score,
          rank: newItem.rank,
          unsubscribePercentage: newItem.unsubscribePercentage
        });
      }, 0);
    }
  }
  function onCreate(key, obj) {
    if (key === address) {
      setTimeout(() => {
        setScore({
          score: obj.score,
          rank: obj.rank,
          unsubscribePercentage: obj.unsubscribePercentage
        });
      }, 0);
    }
  }
  async function get() {
    const value = await db.scores.get(address);
    if (value) {
      setTimeout(async () => {
        setScore({
          score: value.score,
          rank: value.rank,
          unsubscribePercentage: value.unsubscribePercentage
        });
      }, 0);
    }
  }
  useEffect(() => {
    db.scores.hook('updating', onUpdate);
    db.scores.hook('creating', onCreate);
    get();
    return () => {
      db.scores.hook('updating').unsubscribe(onUpdate);
      db.scores.hook('creating').unsubscribe(onCreate);
    };
  }, []);
  return score;
}
