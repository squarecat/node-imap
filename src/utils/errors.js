import React from 'react';
import CreditModal from '../components/modal/credits';

export function getConnectError(reason) {
  switch (reason) {
    case 'not-invited':
      return 'Cannot connect account because it is not invited to your organisation.';
    case 'existing-member':
      return 'Cannot connect account because it is already in use in your organisation.';
    case 'invalid-domain':
      return 'Cannot connect account because it does not belong to your organisation domain.';
    default:
      return 'Something went wrong connecting your account. Please try again or send us a message.';
  }
}

export function getUnsubscribeAlert(
  reason,
  { fromEmail },
  { alertActions, modalActions, credits }
) {
  let options = {
    message: `Unsubscribe to ${fromEmail} failed`,
    autoDismiss: false,
    isDismissable: true,
    level: 'warning'
  };

  switch (reason) {
    case 'organisation-inactive': {
      return {
        ...options,
        id: 'organisation-inactive-warning',
        message: `Unsubscribe to ${fromEmail} failed because your organisation is inactive, please contact your administrator.`
      };
    }
    case 'insufficient-credits': {
      return {
        ...options,
        id: 'insufficient-credits-warning',
        message: `Unsubscribe to ${fromEmail} failed because you have insufficient credits`,
        actions: [
          {
            label: 'Buy more',
            onClick: () => {
              alertActions.dismiss('insufficient-credits-warning');
              modalActions.openModal(<CreditModal credits={credits} />);
            }
          }
        ]
      };
    }
    default:
      return {
        ...options,
        id: 'unsubscribe-failed',
        message: `Unsubscribe to ${fromEmail} failed`
      };
  }
}
