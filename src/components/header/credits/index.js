import './credits.module.scss';

import React, { useCallback, useContext, useEffect, useState } from 'react';

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

  useEffect(
    () => {
      if (isConnected) {
        socket.on('update-credits', async amount => {
          try {
            console.log('update-credits', amount);
            // const newAmount = credits + amount;
            // remove jank
            requestAnimationFrame(() => {
              // setCredits(newAmount);
              incrementUserCredits(amount);
            });
          } catch (err) {
            console.error(err);
          }
        });
        emit('fetch-credits');
      }
    },
    [isConnected, emit, credits, incrementUserCredits, socket]
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
