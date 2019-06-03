import { useEffect, useState } from 'react';

import db from './';

export default function useScore(address) {
  const [score, setScore] = useState('unknown');
  function onUpdate(modifications, key, obj) {
    if (key === address) {
      const newItem = { ...obj, ...modifications };
      setScore({
        score: newItem.score,
        rank: newItem.rank,
        unsubscribePercentage: newItem.unsubscribePercentage
      });
    }
  }
  function onCreate(key, obj) {
    if (key === address) {
      setScore({
        score: obj.score,
        rank: obj.rank,
        unsubscribePercentage: obj.unsubscribePercentage
      });
    }
  }
  async function get() {
    setTimeout(async () => {
      const value = await db.scores.get(address);
      if (value) {
        setScore({
          score: value.score,
          rank: value.rank,
          unsubscribePercentage: value.unsubscribePercentage
        });
      }
    }, 0);
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
