import './credits.module.scss';

import React, { useContext, useEffect, useState } from 'react';

import CreditModal from '../../modal/credits';
import { ModalContext } from '../../../providers/modal-provider';
import useSocket from '../../../utils/hooks/use-socket';
import useUser from '../../../utils/hooks/use-user';

const Credits = () => {
  const { open: openModal } = useContext(ModalContext);
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
      <button
        styleName="btn"
        data-count={unsubscribesRemaining}
        onClick={() =>
          openModal(<CreditModal credits={unsubscribesRemaining} />)
        }
      >
        <span styleName="btn-text">{credits} credits</span>
      </button>
    </>
  );
};

export default Credits;
