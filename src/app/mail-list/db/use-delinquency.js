import { useMemo } from 'react';
import useOccurrence from './use-occurrence';
import useUser from '../../../utils/hooks/use-user';

const useDelinquency = item => {
  const { fromEmail, to: toEmail, date } = item;

  const occurrences = useOccurrence({ fromEmail, toEmail, withLastSeen: true });

  const [{ unsubscriptions }] = useUser(u => ({
    unsubscriptions: u.unsubscriptions,
    showAccount: u.accounts.length > 1 && u.email !== toEmail
  }));

  return useMemo(() => {
    console.log(unsubscriptions);
    const unsub = unsubscriptions.find(u => {
      debugger;
      return u.from.includes(`<${fromEmail}>`) && u.to === toEmail;
    });
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
  }, [date, fromEmail, occurrences.lastSeen, toEmail, unsubscriptions]);
};

export default useDelinquency;
