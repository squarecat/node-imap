import React, { useContext, useEffect, useState } from 'react';

import { AlertContext } from '../../../../providers/alert-provider';
import useUser from '../../../../utils/hooks/use-user';

export default (socket, db) => {
  const [, { addUnsub, incrementUnsubCount }] = useUser();
  const { actions } = useContext(AlertContext);
  const [unsubData, setUnsubData] = useState(null);

  useEffect(() => {
    if (socket) {
      socket.on('unsubscribe:success', async ({ id, data }, ack) => {
        console.debug(`[db]: successfully unsubscribed from ${id}`);
        try {
          const {
            estimatedSuccess,
            unsubStrategy,
            hasImage,
            mail: mailData,
            unsubscribeId,
            unsubscribeLink,
            unsubscribeMailTo,
            unsubscribedAt
          } = data;
          let update = {
            estimatedSuccess,
            unsubStrategy,
            hasImage,
            isLoading: false,
            status: estimatedSuccess ? 'unsubscribed' : 'failed'
          };
          if (unsubStrategy === 'mailto') {
            const { emailStatus, emailData } = data;
            update = {
              ...update,
              emailStatus,
              emailData
            };
          }
          addUnsub({
            estimatedSuccess,
            date: mailData.date,
            from: mailData.from,
            to: mailData.to,
            hasImage,
            id,
            unsubscribeId,
            unsubscribeLink,
            unsubscribeMailTo,
            unsubscribeStrategy: unsubStrategy,
            unsubscribedAt
          });
          await db.mail.update(id, update);
          const mail = await db.mail.get(id);
          if (!estimatedSuccess) {
            actions.queueAlert({
              message: <span>{`Unsubscribe to ${mail.fromEmail} failed`}</span>,
              actions: [
                {
                  label: 'See details',
                  onClick: () => {
                    // defensive code against an old bug where unsubStrategy can be null
                    let strat = mail.unsubStrategy;
                    if (!strat) {
                      strat = mail.unsubscribeLink ? 'link' : 'mailto';
                    }
                    setUnsubData({ ...mail, unsubStrategy: strat });
                  }
                }
              ],
              isDismissable: true,
              level: 'warning'
            });
          }
          incrementUnsubCount();
        } catch (err) {
          console.error(`[db]: failed to set successful unsubscribe`);
          console.error(err);
        } finally {
          ack && ack();
        }
      });
    }
    return () => {
      if (socket) {
        socket.off('unsubscribe:success');
      }
    };
  }, [actions, addUnsub, db.mail, incrementUnsubCount, socket]);

  return unsubData;
};
