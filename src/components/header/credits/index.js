import '../header-btn.module.scss';

import React, { useEffect, useState } from 'react';

import useSocket from '../../../utils/hooks/use-socket';
import useUser from '../../../utils/hooks/use-user';

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
        socket.on('credits', async data => {
          try {
            console.log('credits', data);
            setCredits(data);
          } catch (err) {
            console.error(err);
          }
        });
        socket.emit('fetch-credits');
      }
    },
    [isConnected, error]
  );

  return (
    <button styleName="header-btn" onClick={() => {}}>
      <span styleName="header-btn-text header-btn-text--long">
        {credits} credits
      </span>
    </button>
  );
};
