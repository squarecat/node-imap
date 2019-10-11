import { useEffect } from 'react';

export default (socket, db) => {
  useEffect(() => {
    if (socket) {
      socket.on('scores', async (data, ack) => {
        console.debug(`[db]: received ${data.length} new mail scores`);
        try {
          await db.scores.bulkPut(
            data.map(d => ({
              address: d.address,
              score: d.score,
              rank: d.rank,
              unsubscribePercentage: d.unsubscribePercentage,
              senderScore: d.senderScore
            }))
          );
          await data.reduce(async (p, d) => {
            await p;
            return db.mail
              .where('fromEmail')
              .equals(d.address)
              .modify({ score: d.score });
          }, Promise.resolve());
        } catch (err) {
          console.error(`[db]: failed setting new mail scores`);
          console.error(err);
        } finally {
          ack && ack();
        }
      });
    }
    return () => {
      if (socket) {
        socket.off('scores');
      }
    };
  }, [db.mail, db.scores, socket]);
};
