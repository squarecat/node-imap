import { useContext, useMemo } from 'react';

import { DatabaseContext } from '../../../providers/db-provider';
import { SocketContext } from '../../../providers/socket-provider';
import useFetch from './actions/use-fetch';
import useMailErrorEvent from './events/on-mail-error';
import useMailProgressEvent from './events/on-progress';
import useMailReceievedEvent from './events/on-mail-received';
import useResolveUnsubscribe from './actions/use-resolve-unsubscribe';
import useBuffer from './events/on-buffered-events';
import useUnsubscribe from './actions/use-unsubscribe';
import useUnsubscribeErrorEvent from './events/on-unsubscribe-error';
import useUnsubscribeSuccessEvent from './events/on-unsubscribe-success';
import useUpdateOccurrences from './actions/use-update-occurrences';

export default function useMailSocket() {
  const { socket, emit } = useContext(SocketContext);
  const db = useContext(DatabaseContext);

  const { onErr } = useMailErrorEvent(socket, db);
  const { onMail, onEnd } = useMailReceievedEvent(socket, db, emit);
  useUnsubscribeErrorEvent(socket, db);
  useUnsubscribeSuccessEvent(socket, db);
  const { onProgress, onProgressEnd } = useMailProgressEvent(socket, db);

  const events = {
    onMail,
    onErr,
    onEnd,
    onProgress,
    onProgressEnd
  };

  useBuffer(socket, events);

  const fetch = useFetch();
  const resolveUnsubscribe = useResolveUnsubscribe();
  const unsubscribe = useUnsubscribe();
  const setOccurrencesSeen = useUpdateOccurrences();

  const actions = useMemo(() => {
    return {
      fetch,
      resolveUnsubscribe,
      unsubscribe,
      setOccurrencesSeen
    };
  }, [fetch, resolveUnsubscribe, setOccurrencesSeen, unsubscribe]);

  console.log('[db]: re-rendering socket functions');
  return {
    socket,
    emit,
    actions
  };
}

useMailSocket.whyDidYouRender = true;
