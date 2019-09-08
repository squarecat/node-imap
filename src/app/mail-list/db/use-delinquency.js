import React, { useMemo } from 'react';

import useOccurrence from './use-occurrence';
import useUser from '../../../utils/hooks/use-user';

function useDelinquency({ fromEmail, to: toEmail, date }) {
  const occurrences = useOccurrence({
    fromEmail,
    toEmail
  });
  const [{ unsubscriptions }] = useUser(u => ({
    unsubscriptions: u.unsubscriptions
  }));
  const unsub = useMemo(
    () =>
      unsubscriptions.find(un => {
        return un.from.includes(`<${fromEmail}>`) && un.to === toEmail;
      }),
    [unsubscriptions, fromEmail, toEmail]
  );

  return useMemo(() => {
    if (unsub) {
      let lastSeen;
      const { reported, reportedAt } = unsub;
      if (!occurrences.lastSeen) {
        lastSeen = date;
      } else {
        lastSeen = occurrences.lastSeen;
      }
      const { unsubscribedAt } = unsub;
      const delinquent = lastSeen > new Date(unsubscribedAt);
      return { delinquent, reported, reportedAt };
    }
    return { delinquent: false, reported: false, reportedAt: null };
  }, [date, fromEmail, occurrences.lastSeen, toEmail, unsub]);
}

export default useDelinquency;
