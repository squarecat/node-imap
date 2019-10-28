import useUser from '../../../utils/hooks/use-user';
import { useMemo, useCallback } from 'react';
import request from '../../../utils/request';

export default ({ fromEmail }) => {
  const [ignoredSenderList, { setIgnoredSenderList }] = useUser(
    u => u.ignoredSenderList || []
  );

  const isIgnored = useMemo(() => {
    return ignoredSenderList.includes(fromEmail);
  }, [ignoredSenderList, fromEmail]);

  const setIgnored = useCallback(() => {
    const newList = isIgnored
      ? ignoredSenderList.filter(sender => sender !== fromEmail)
      : [...ignoredSenderList, fromEmail];
    toggleFromIgnoreList(fromEmail, isIgnored ? 'remove' : 'add');
    setIgnoredSenderList(newList);
    return false;
  }, [ignoredSenderList, isIgnored, fromEmail, setIgnoredSenderList]);

  return [
    {
      isIgnored
    },
    {
      setIgnored
    }
  ];
};

export async function toggleFromIgnoreList(email, op) {
  return request('/api/me/ignore', {
    method: 'PATCH',
    body: JSON.stringify({ op, value: email })
  });
}
