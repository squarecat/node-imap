import { useCallback, useContext } from 'react';

import { DatabaseContext } from '../../../../providers/db-provider';
import { SocketContext } from '../../../../providers/socket-provider';

export default function() {
  const { emit } = useContext(SocketContext);
  const db = useContext(DatabaseContext);
  return useCallback(
    async data => {
      try {
        console.debug(`[db]: resolving unsubscribe error from ${data.mailId}`);
        await db.mail.update(data.mailId, {
          error: false,
          subscribed: false,
          estimatedSuccess: data.success,
          resolved: true
        });
        emit('unsubscribe-error-response', data);
      } catch (err) {
        console.error('[db]: failed to resolve unsubscribe error');
        console.error(err);
      }
    },
    [db.mail, emit]
  );
}
