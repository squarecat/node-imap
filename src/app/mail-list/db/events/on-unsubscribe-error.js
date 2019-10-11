import { useContext, useEffect } from 'react';

import { AlertContext } from '../../../../providers/alert-provider';
import { ModalContext } from '../../../../providers/modal-provider';
import { getUnsubscribeAlert } from '../../../../utils/errors';
import useUser from '../../../../utils/hooks/use-user';

export default (socket, db) => {
  const [{ credits }] = useUser(u => ({
    credits: u.billing ? u.billing.credits : 0
  }));
  const { actions } = useContext(AlertContext);
  const { open: openModal } = useContext(ModalContext);

  useEffect(() => {
    if (socket) {
      socket.on('unsubscribe:err', async ({ id, err }, ack) => {
        console.debug(`[db]: received unsubscribe error`);
        try {
          const { data } = err;
          const mail = await db.mail.get(id);
          const alert = getUnsubscribeAlert({
            id: err.id,
            reason: data.errKey,
            mail,
            alertActions: actions,
            modalActions: { openModal },
            credits
          });

          await db.mail.update(id, {
            isLoading: false,
            subscribed: true,
            status: 'failed'
          });
          actions.queueAlert(alert);
        } catch (err) {
          console.error(`[db]: failed to set failed unsubscribe`);
          console.error(err);
        } finally {
          ack && ack();
        }
      });
    }
    return () => {
      if (socket) {
        socket.off('unsubscribe:err');
      }
    };
  }, [actions, credits, db.mail, openModal, socket]);
};
