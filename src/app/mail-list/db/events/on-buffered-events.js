import { useEffect } from 'react';

export default (socket, eventHandlers) => {
  useEffect(() => {
    async function onBuffer(events, ack) {
      // merge events
      console.log('[buffered]', events);
      const { mailReceievedEvent, endEvent, progressEvents } = events.reduce(
        (out, ev) => {
          console.log('[buffer]', ev);
          if (ev.event === 'mail') {
            return {
              ...out,
              mailReceievedEvent: {
                duplicateSubscriptions: [
                  ...out.mailReceievedEvent.duplicateSubscriptions,
                  ...ev.data.duplicateSubscriptions
                ],
                newSubscriptions: [
                  ...out.mailReceievedEvent.newSubscriptions,
                  ...ev.data.newSubscriptions
                ]
              }
            };
          }
          if (ev.event === 'mail:end' || ev.event === 'mail:err') {
            return {
              ...out,
              endEvent: {
                err: ev.event === 'mail:err',
                data: ev.data
              }
            };
          }
          if (ev.event === 'mail:progress') {
            return {
              ...out,
              progressEvents: [ev.data, ...out.progressEvents]
            };
          }
          return out;
        },
        {
          mailReceievedEvent: {
            duplicateSubscriptions: [],
            newSubscriptions: []
          },
          endEvent: null,
          progressEvents: []
        }
      );

      // apply the events in their intended order
      if (
        mailReceievedEvent.duplicateSubscriptions.length ||
        mailReceievedEvent.newSubscriptions.length
      ) {
        eventHandlers.onMail(mailReceievedEvent);
      }
      if (endEvent && endEvent.err) {
        eventHandlers.onErr(endEvent.data);
      } else if (endEvent && !endEvent.err) {
        eventHandlers.onEnd(endEvent.data);
        eventHandlers.onProgressEnd(endEvent.data);
      } else if (!endEvent && progressEvents.length) {
        // if not ended then we'll probably have some progress events
        // only process the most recent one
        eventHandlers.onProgress(progressEvents[0]);
      }

      ack && ack();
    }

    if (socket) {
      socket.on('buffered', onBuffer);
    }
    return () => {
      if (socket) {
        socket.off('buffered', onBuffer);
      }
    };
  }, [socket]);
};
