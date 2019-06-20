import CreditModal from '../components/modal/credits';
import React from 'react';
import { TextLink } from '../components/text';

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

export function getAuthError(err = {}, authType) {
  let msg = '';
  if (authType === 'signup') {
    msg = ' signing you up';
  }
  if (authType === 'login') {
    msg = ' logging you in';
  }
  if (authType === 'reset') {
    msg = ' resetting your password';
  }
  if (authType === 'change') {
    msg = ' changing your password';
  }

  const defaultMsg = `Something went wrong${msg}. Please try again or send us a message.`;
  if (!err) return defaultMsg;

  const { id, reason } = err;

  switch (reason) {
    case 'not-found':
      return <span>User not found or password is incorrect.</span>;
    case 'invalid-reset-code':
      return <span>That reset code is invalid.</span>;
    case 'expired-reset-code':
      return <span>That reset code has expired.</span>;
    case 'auth-provider-error':
      return (
        <span>
          That email address has already been used to sign in with a different
          provider. Maybe you signed in using a password last time?
        </span>
      );
    case 'beta':
      return (
        <span>
          You do not have access to the beta.{' '}
          <TextLink href="/join-beta" inverted>
            Request access here
          </TextLink>
          .
        </span>
      );
    default:
      return (
        <>
          <span>{defaultMsg}</span>
          {id ? <span>{` Error code: ${id}`}.</span> : null}
        </>
      );
  }
}

export function getUnsubscribeAlert({
  id = 0,
  reason,
  mail,
  alertActions,
  modalActions,
  credits
}) {
  let options = {
    message: `Unsubscribe to ${mail.fromEmail} failed`,
    autoDismiss: false,
    isDismissable: true,
    level: 'warning'
  };

  switch (reason) {
    case 'organisation-inactive': {
      return {
        ...options,
        id: 'organisation-inactive-warning',
        message: `Unsubscribe to ${
          mail.fromEmail
        } failed because your organisation is inactive, please contact your administrator.`
      };
    }
    case 'insufficient-credits': {
      return {
        ...options,
        id: 'insufficient-credits-warning',
        message: `Unsubscribe to ${
          mail.fromEmail
        } failed because you have insufficient credits`,
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
        message: `Unsubscribe to ${mail.fromEmail} failed. Error code: ${id}.`
      };
  }
}
