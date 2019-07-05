import './credits.module.scss';

import React, { useCallback, useContext, useEffect } from 'react';

import CreditModal from '../../modal/credits';
import { ModalContext } from '../../../providers/modal-provider';
import useSocket from '../../../utils/hooks/use-socket';
import useUser from '../../../utils/hooks/use-user';

const Credits = () => {
  const { open: openModal } = useContext(ModalContext);
  const [
    { id, token, credits },
    { incrementCredits: incrementUserCredits }
  ] = useUser(({ id, token, billing }) => ({
    id,
    token,
    credits: billing ? billing.credits : 0
  }));

  const { isConnected, socket, emit } = useSocket({
    token,
    userId: id
  });

  const update = useCallback(
    async amount => {
      let frameRequestId;

      console.log('update-credits', amount);
      // remove jank
      frameRequestId = requestAnimationFrame(() => {
        incrementUserCredits(amount);
      });

      return () => cancelAnimationFrame(frameRequestId);
    },
    [incrementUserCredits]
  );

  useEffect(
    () => {
      if (isConnected) {
        socket.on('update-credits', update);
        emit('fetch-credits');
      }
      return () => {
        if (socket) {
          socket.off('update-credits', update);
        }
      };
    },
    [isConnected, emit, credits, incrementUserCredits, socket, update]
  );

  const onClick = useCallback(
    () => {
      openModal(<CreditModal credits={credits} />);
    },
    [credits, openModal]
  );

  return (
    <>
      <button styleName="btn" data-count={credits} onClick={onClick}>
        <span styleName="btn-text">{credits} credits</span>
      </button>
    </>
  );
};

export default Credits;
