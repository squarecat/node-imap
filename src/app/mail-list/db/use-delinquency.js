import { useMemo } from 'react';
import useUser from '../../../utils/hooks/use-user';

function useDelinquency(mailItem) {
  const latestOccurrence = mailItem.getLatest();
  const { fromEmail, to: toEmail, date } = latestOccurrence;
  const [unsub] = useUser(u => {
    return u.unsubscriptions.find(un => {
      return un.from.includes(`<${fromEmail}>`) && un.to === toEmail;
    });
  });

  return useMemo(() => {
    if (unsub) {
      const { reported, reportedAt } = unsub;
      const { unsubscribedAt } = unsub;
      const delinquent = date > new Date(unsubscribedAt);
      return { delinquent, reported, reportedAt };
    }
    return { delinquent: false, reported: false, reportedAt: null };
  }, [date, unsub]);
}

export default useDelinquency;
