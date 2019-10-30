import './credits.module.scss';

import React, { useCallback, useContext, useEffect } from 'react';

import CreditModal from '../../modal/credits';
import { ModalContext } from '../../../providers/modal-provider';
import useUser from '../../../utils/hooks/use-user';
import { SocketContext } from '../../../providers/socket-provider';

const Credits = () => {
  const { open: openModal } = useContext(ModalContext);
  const { emit, socket, isConnected } = useContext(SocketContext);

  const [credits, { incrementCredits: incrementUserCredits }] = useUser(
    ({ billing }) => (billing ? billing.credits : 0)
  );

  const update = useCallback(
    async amount => {
      let frameRequestId;
      // remove jank
      frameRequestId = requestAnimationFrame(() => {
        incrementUserCredits(amount);
      });
      return () => cancelAnimationFrame(frameRequestId);
    },
    [incrementUserCredits]
  );

  useEffect(() => {
    if (socket && isConnected) {
      socket.on('update-credits', update);
      emit('fetch-credits');
    }
    return () => {
      if (socket) {
        socket.off('update-credits', update);
      }
    };
  }, [isConnected, emit, credits, incrementUserCredits, socket, update]);

  const onClick = useCallback(() => {
    openModal(<CreditModal credits={credits} />);
  }, [credits, openModal]);

  return (
    <>
      <button styleName="btn" data-count={credits} onClick={onClick}>
        <span styleName="btn-text">{credits} credits</span>
      </button>
    </>
  );
};

export default Credits;
