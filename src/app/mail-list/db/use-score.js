import { useContext, useEffect, useState } from 'react';

import { DatabaseContext } from '../../../providers/db-provider';

export default function useScore(address) {
  const db = useContext(DatabaseContext);
  const [score, setScore] = useState({
    rank: null,
    score: 0,
    unsubscribePercentage: 0
  });

  useEffect(() => {
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
    db.scores.hook('updating', onUpdate);
    db.scores.hook('creating', onCreate);

    return () => {
      db.scores.hook('updating').unsubscribe(onUpdate);
      db.scores.hook('creating').unsubscribe(onCreate);
    };
  }, [address, db.scores]);

  useEffect(() => {
    async function get() {
      if (address) {
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
    }
    get();
  }, [address, db.scores]);
  return score;
}
