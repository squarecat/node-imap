import { useEffect, useState } from 'react';

export default (socket, db) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    async function onEnd(ack) {
      if (isFetching) {
        setIsFetching(false);
        setImmediate(async () => {
          const currentProgress = await db.prefs.get('progress');
          await db.prefs.put({
            key: 'progress',
            value: {
              ...(currentProgress ? currentProgress.value : {}),
              finishedAt: Date.now(),
              inProgress: false
            }
          });
          console.debug('progress: finished');
        });
      }
      ack();
    }
    async function onStart(ack) {
      if (!isFetching) {
        setIsFetching(true);
        setImmediate(async () => {
          const currentProgress = await db.prefs.get('progress');
          await db.prefs.put({
            key: 'progress',
            value: {
              ...(currentProgress ? currentProgress.value : {}),
              startedAt: Date.now(),
              inProgress: true
            }
          });
          console.debug('progress: finished');
        });
      }
      ack();
    }

    if (socket) {
      socket.on('mail:start', onStart);
      socket.on('mail:end', onEnd);
      socket.on('mail:err', onEnd);
    }
    return () => {
      if (socket) {
        socket.off('mail:start', onStart);
        socket.off('mail:end', onEnd);
        socket.on('mail:err', onEnd);
      }
    };
  }, [db.prefs, isFetching, socket]);

  useEffect(() => {
    if (socket) {
      socket.on('mail:progress', async ({ account, progress, total }, ack) => {
        let percentage;
        if (progress + total === 0) {
          percentage = 0;
        } else {
          percentage = (progress / total) * 100;
        }

        setImmediate(async () => {
          const currentProgress = await db.prefs.get('progress');
          await db.prefs.put({
            key: 'progress',
            value: {
              ...(currentProgress ? currentProgress.value : {}),
              [account]: percentage
            }
          });
          console.debug('progress:', account, progress, total);
        });

        ack && ack();
      });
    }
    return () => {
      if (socket) {
        socket.off('mail:progress');
      }
    };
  }, [db.prefs, socket]);
};
