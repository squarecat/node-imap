import { useContext, useEffect } from 'react';

import { DatabaseContext } from '../../../providers/db-provider';
import { SocketContext } from '../../../providers/socket-provider';
import useFetch from './actions/use-fetch';
import useMailErrorEvent from './events/on-mail-error';
import useMailProgressEvent from './events/on-progress';
import useMailReceievedEvent from './events/on-mail-received';
import useResolveUnsubscribe from './actions/use-resolve-unsubscribe';
import useScoresEvent from './events/on-scores-received';
import useUnsubscribe from './actions/use-unsubscribe';
import useUnsubscribeErrorEvent from './events/on-unsubscribe-error';
import useUnsubscribeSuccessEvent from './events/on-unsubscribe-success';
import useUpdateOccurrences from './actions/use-update-occurrences';

export default function useMailSocket() {
  const { socket, emit } = useContext(SocketContext);
  const db = useContext(DatabaseContext);

  useMailErrorEvent(socket, db);
  useMailReceievedEvent(socket, db, emit);
  useUnsubscribeErrorEvent(socket, db);
  useUnsubscribeSuccessEvent(socket, db);
  useScoresEvent(socket, db);
  useMailProgressEvent(socket, db);

  const fetch = useFetch();
  const resolveUnsubscribe = useResolveUnsubscribe();
  const unsubscribe = useUnsubscribe();
  const setOccurrencesSeen = useUpdateOccurrences();

  return {
    socket,
    emit,
    actions: {
      fetch,
      resolveUnsubscribe,
      unsubscribe,
      setOccurrencesSeen
    }
  };
}

useMailSocket.whyDidYouRender = true;
