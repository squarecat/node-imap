import { useCallback, useContext } from 'react';

import { DatabaseContext } from '../../../../providers/db-provider';
import { SocketContext } from '../../../../providers/socket-provider';
import useUser from '../../../../utils/hooks/use-user';

export default function() {
  const db = useContext(DatabaseContext);
  const { emit } = useContext(SocketContext);

  return useCallback(
    async ({ senders }) => {
      const [{ preferences }] = useUser(u => ({
        accountIds: u.accounts.map(a => a.id).filter(a => !a.problem),
        hasAccountProblem: u.accounts.some(a => a.problem)
      }));
      if (preferences.occurrencesConsent) {
        await db.mail
          .where('fromEmail')
          .anyOf(senders)
          .modify({ seen: true });
        emit('occurrences', senders);
      }
    },
    [db.mail, emit]
  );
}
