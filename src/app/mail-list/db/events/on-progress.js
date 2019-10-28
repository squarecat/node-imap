import { useEffect, useState, useCallback } from 'react';

export default (socket, db) => {
  const [isFetching, setIsFetching] = useState(false);

  const onProgress = useCallback(
    async ({ account, progress, total }, ack) => {
      let percentage;
      if (progress + total === 0) {
        percentage = 0;
      } else {
        percentage = (progress / total) * 100;
      }

      // if there was a scan already running when the page was
      // loaded then we never would have got a start event
      if (percentage < 100 && !isFetching) {
        setIsFetching(true);
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
    },
    [db.prefs, isFetching]
  );

  const onProgressEnd = useCallback(
    async (d, ack) => {
      if (isFetching) {
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
          setIsFetching(false);
          console.debug('progress: finished');
        });
      }
      ack && ack();
    },
    [db.prefs, isFetching]
  );

  const onStart = useCallback(
    async (data, ack) => {
      if (!isFetching) {
        setIsFetching(true);
        setImmediate(async () => {
          const currentProgress = await db.prefs.get('progress');
          await db.prefs.put({
            key: 'progress',
            value: {
              ...(currentProgress ? currentProgress.value : {}),
              startedAt: data.startedAt,
              inProgress: true
            }
          });
          console.debug('progress: started');
        });
      }
      ack && ack();
    },
    [db.prefs, isFetching]
  );

  useEffect(() => {
    if (socket) {
      socket.on('mail:start', onStart);
      socket.on('mail:end', onProgressEnd);
      socket.on('mail:err', onProgressEnd);
    }
    return () => {
      if (socket) {
        socket.off('mail:start', onStart);
        socket.off('mail:end', onProgressEnd);
        socket.off('mail:err', onProgressEnd);
      }
    };
  }, [db.prefs, isFetching, onProgressEnd, onStart, socket]);

  useEffect(() => {
    if (socket) {
      socket.on('mail:progress', onProgress);
    }
    return () => {
      if (socket) {
        socket.off('mail:progress');
      }
    };
  }, [onProgress, socket]);

  return {
    onProgress,
    onProgressEnd
  };
};
