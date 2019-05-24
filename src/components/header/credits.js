import React, { useEffect, useState } from 'react';

import useSocket from '../../app/mail-list/socket';
import useUser from '../../utils/hooks/use-user';

export default () => {
  const [{ id, token, unsubscribesRemaining }] = useUser(
    ({ id, token, billing }) => ({
      id,
      token,
      unsubscribesRemaining: billing ? billing.unsubscribesRemaining : 0
    })
  );

  const { isConnected, socket, error } = useSocket({
    token,
    userId: id
  });

  const [credits, setCredits] = useState(unsubscribesRemaining);

  useEffect(
    () => {
      if (isConnected) {
        socket.emit('fetch-credits');
        socket.on('credits', async data => {
          try {
            console.log('credits', data);
            setCredits(data);
          } catch (err) {
            console.error(err);
          }
        });
      }
    },
    [isConnected, error]
  );

  return <span>{credits} credits</span>;
};
