import './credits.module.scss';

import React, { useEffect, useState } from 'react';

import CreditModal from '../../modal/credits';
import useSocket from '../../../utils/hooks/use-socket';
import useUser from '../../../utils/hooks/use-user';

const Credits = () => {
  const [{ id, token, unsubscribesRemaining }] = useUser(
    ({ id, token, billing }) => ({
      id,
      token,
      unsubscribesRemaining: billing ? billing.unsubscribesRemaining : 0
    })
  );

  const { isConnected, socket, emit } = useSocket({
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
        emit('fetch-credits');
      }
    },
    [isConnected, emit]
  );

  return (
    <>
      <CreditModal credits={unsubscribesRemaining} />
      <button
        styleName="btn"
        data-count={unsubscribesRemaining}
        onClick={() => {}}
      >
        <span styleName="btn-text">{credits} credits</span>
      </button>
    </>
  );
};

// Credits.whyDidYouRender = true;
export default Credits;
