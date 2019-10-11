import { useCallback, useContext } from 'react';

import { DatabaseContext } from '../../../../providers/db-provider';
import { SocketContext } from '../../../../providers/socket-provider';
import useUser from '../../../../utils/hooks/use-user';

export default function() {
  const db = useContext(DatabaseContext);
  const { emit } = useContext(SocketContext);
  const [preferences] = useUser(u => u.preferences);

  const updateOccurrences = useCallback(
    async ({ senders } = {}) => {
      if (preferences.occurrencesConsent) {
        await db.mail
          .where('fromEmail')
          .anyOf(senders)
          .modify({ seen: true });

        emit('occurrences', senders);
      }
    },
    [db.mail, emit, preferences]
  );
  return updateOccurrences;
}
