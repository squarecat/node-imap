import { useCallback, useContext } from 'react';

import { AlertContext } from '../../../../providers/alert-provider';
import { DatabaseContext } from '../../../../providers/db-provider';
import { ModalContext } from '../../../../providers/modal-provider';
import { SocketContext } from '../../../../providers/socket-provider';
import { getUnsubscribeAlert } from '../../../../utils/errors';
import useUser from '../../../../utils/hooks/use-user';

export default function() {
  const { emit } = useContext(SocketContext);
  const db = useContext(DatabaseContext);
  const [{ credits, organisationId, organisationActive }] = useUser(u => ({
    credits: u.billing ? u.billing.credits : 0,
    organisationId: u.organisationId,
    organisationActive: u.organisationActive
  }));
  const { actions } = useContext(AlertContext);
  const { open: openModal } = useContext(ModalContext);

  return useCallback(
    async mailItem => {
      try {
        console.debug(`[db]: unsubscribing from ${mailItem.id}`);
        const { allowed, reason } = canUnsubscribe({
          credits,
          organisationId,
          organisationActive
        });
        if (!allowed) {
          const alert = getUnsubscribeAlert({
            reason,
            mail: mailItem,
            alertActions: actions,
            modalActions: { openModal },
            credits
          });
          actions.setAlert(alert);
          return false;
        }
        await db.mail.update(mailItem.id, {
          isLoading: true,
          subscribed: false
        });
        emit('unsubscribe', mailItem);
        return true;
      } catch (err) {
        console.error('[db]: failed to unsubscribe mail');
        console.error(err);
      }
    },
    [
      actions,
      credits,
      db.mail,
      emit,
      openModal,
      organisationActive,
      organisationId
    ]
  );
}

function canUnsubscribe({ credits, organisationId, organisationActive }) {
  if (organisationId && !organisationActive) {
    console.debug('[db]: unsubscribe failed - organisation inactive');
    return {
      allowed: false,
      reason: 'organisation-inactive'
    };
  } else if (!organisationId && credits <= 0) {
    console.debug('[db]: unsubscribe failed - insufficient credits');
    return {
      allowed: false,
      reason: 'insufficient-credits'
    };
  }
  return { allowed: true };
}
