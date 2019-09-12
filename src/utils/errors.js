import CreditModal from '../components/modal/credits';
import React from 'react';
import { TextLink } from '../components/text';
import { openChat } from '../utils/chat';

export function getConnectError(err = {}) {
  const { reason } = err;

  if (err.reason && err.reason.type && err.reason.type.startsWith('imap')) {
    return getImapError(reason);
  }

  switch (reason) {
    case 'not-invited':
      return {
        message:
          'Cannot connect account because it is not invited to your team.',
        level: 'warning'
      };
    case 'existing-member':
      return {
        message:
          'Cannot connect account because it is already in use in your team.',
        level: 'warning'
      };
    case 'invalid-domain':
      return {
        message:
          'Cannot connect account because it does not belong to your team domain.',
        level: 'warning'
      };
    case 'auth-provider-error':
      return {
        message: (
          <span>
            That email address has already been used to sign in.{' '}
            <TextLink undecorated inverted onClick={() => openChat()}>
              Contact us
            </TextLink>{' '}
            if you would like us to merge your accounts.
          </span>
        ),
        level: 'warning',
        actions: [
          {
            label: 'Contact us',
            onClick: () => {
              openChat();
            }
          }
        ]
      };
    case 'auth-account-error':
      return {
        message: (
          <span>
            That email address is already attached to another account. If you
            want to connect it to this account then first remove it from the
            other account.
          </span>
        ),
        level: 'warning'
      };
    default:
      return {
        message:
          'Something went wrong connecting your account. Please try again or send us a message.',
        level: 'error'
      };
  }
}

export function getImapError(reason) {
  const { type } = reason;
  // this will be thrown if node has caught an error with a message
  if (type === 'imap-auth-error' || type === 'imap-connect-error') {
    return {
      message: (
        <>
          <p>
            Failed to connect account. The host responded with this message:
          </p>
          <p>{reason.message}</p>
        </>
      ),
      level: 'error'
    };
  }

  // otherwise show our auth error
  return {
    message:
      'Failed to authenticate with IMAP server. Please try again or send us a message.',
    level: 'error'
  };
}

export function getAccountProblem(reason) {
  switch (reason) {
    case 'password-invalidated':
      return `Since you reset your password your IMAP credentials are now invalid. Please remove this account and connect it again.`;
    default:
      return `There is a problem with this IMAP account. Please try removing this account and connecting it again, or send us a message.`;
  }
}

export function getBasicError(err = {}) {
  const defaultMsg = `Something went wrong. Please try again or send us a message.`;
  if (!err) return defaultMsg;

  const { id } = err;

  return (
    <>
      <span>{defaultMsg}</span>
      {id ? <span>{` Error code: ${id}`}.</span> : null}
    </>
  );
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
    case 'auth-account-error':
      return (
        <span>
          That email address is already attached to another account. If you want
          to use it to log in then first remove it from the other account.
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
    case 'not-authorized': {
      return (
        <span>
          You were logged out because your session expired. Please log in again
          to continue.
        </span>
      );
    }
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
        message: `Unsubscribe to ${mail.fromEmail} failed because your team is inactive, please contact your administrator.`
      };
    }
    case 'insufficient-credits': {
      return {
        ...options,
        message: `Unsubscribe to ${mail.fromEmail} failed because you have insufficient credits`,
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

export function getPaymentError(err = {}) {
  if (err.reason && err.reason.type === 'stripe-card-error') {
    return err.reason.message;
  }
  if (err.requires_payment_method) {
    // same as Stripe failed to authenticate 3D secure message
    return `We are unable to authenticate your payment method. Please choose a different payment method and try again.`;
  }

  return getBasicError();
}

export function getSocketError(err = {}) {
  const defaultMsg = `Couldn't connect to server, please refresh and try again. If the problem continues then send us a message.`;

  if (err && err.message) {
    return err.message;
  }

  return defaultMsg;
}
