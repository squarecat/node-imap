import React, { useContext, useEffect } from 'react';

import { AlertContext } from '../../../../providers/alert-provider';
import { getMailError } from '../../../../utils/errors';
import { navigate } from 'gatsby';
import useUser from '../../../../utils/hooks/use-user';

export default socket => {
  const [, { invalidateAccount }] = useUser();
  const { actions } = useContext(AlertContext);

  useEffect(() => {
    if (socket) {
      socket.on('mail:err', (err = {}, ack) => {
        console.error(`[db]: scan failed`);

        const message = getMailError(err);
        let problem = false;

        if (err.data && err.data.problem && err.data.accountId) {
          problem = err.data.problem;
          invalidateAccount(err.data.accountId, err.data.problem);
        }

        actions.setAlert({
          message: <span>{message}</span>,
          isDismissable: true,
          autoDismiss: false,
          level: 'error',
          actions: !problem
            ? []
            : [
                {
                  label: 'Go to accounts',
                  onClick: () => {
                    navigate('/app/profile/accounts');
                  }
                }
              ]
        });

        ack && ack();
      });
    }

    return () => {
      if (socket) {
        socket.off('mail:err');
      }
    };
  }, [actions, invalidateAccount, socket]);
};
