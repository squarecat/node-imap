import './connect.module.scss';

import React, { useCallback, useContext, useEffect } from 'react';

import { AtSignIcon } from '../icons';
import ImapModal from '../modal/imap';
import { ModalContext } from '../../providers/modal-provider';
import aolLogo from '../../assets/providers/imap/aol-logo.png';
import fastmailLogo from '../../assets/providers/imap/fastmail-logo-small.jpg';
import googleLogo from '../../assets/providers/google-logo.png';
import icloudLogo from '../../assets/providers/imap/icloud-logo-small.jpg';
import microsoftLogo from '../../assets/providers/microsoft-logo.png';
import yahooLogo from '../../assets/providers/imap/yahoo-logo.png';

let windowObjectReference = null;
let previousUrl = null;
const strWindowFeatures = [
  'height=700',
  'width=600',
  'top=100',
  'left=100',
  // A dependent window closes when its parent window closes.
  'dependent=yes',
  // hide menubars and toolbars for the simplest popup
  'menubar=no',
  'toolbar=no',
  'location=yes',
  // enable for accessibility
  'resizable=yes',
  'scrollbars=yes',
  'status=yes',
  // chrome specific
  'chrome=yes',
  'centerscreen=yes'
].join(',');

export default ({
  provider = 'password',
  onSuccess = () => {},
  onError = () => {},
  imapOptions = {}
}) => {
  const { replace: replaceModal } = useContext(ModalContext);

  useEffect(() => {
    return function cleanup() {
      window.removeEventListener('message', receiveMessage);
    };
  });
  const openImapModal = useCallback(
    type => {
      replaceModal(<ImapModal providerType={type} onConfirm={onSuccess} />, {
        ...imapOptions,
        context: { step: 'accounts' }
      });
    },
    [imapOptions, onSuccess, replaceModal]
  );

  const receiveMessage = event => {
    // Do we trust the sender of this message?  (might be
    // different from what we originally opened, for example).
    if (event.origin !== process.env.BASE_URL) {
      return;
    }
    const { data } = event;

    if (data.source === 'lma-connect-redirect') {
      const { payload } = data;
      if (payload.error) {
        return onError(payload.error);
      }

      return onSuccess();
    }
  };

  const openSignInWindow = (url, name) => {
    window.removeEventListener('message', receiveMessage);

    if (windowObjectReference === null || windowObjectReference.closed) {
      windowObjectReference = window.open(url, name, strWindowFeatures);
    } else if (previousUrl !== url) {
      windowObjectReference = window.open(url, name, strWindowFeatures);
      windowObjectReference.focus();
    } else {
      windowObjectReference.focus();
    }

    window.addEventListener(
      'message',
      event => receiveMessage(event, provider),
      false
    );
    previousUrl = url;
  };

  if (provider === 'google') {
    return (
      <a
        href="/auth/google/connect"
        target="SignInWindow"
        onClick={() => {
          openSignInWindow('/auth/google/connect', 'SignInWindow');
          return false;
        }}
        styleName="connect-btn"
      >
        <img src={googleLogo} alt="Google logo" styleName="connect-btn-logo" />
      </a>
    );
  } else if (provider === 'outlook') {
    return (
      <a
        href="/auth/outlook/connect"
        target="SignInWindow"
        onClick={() => {
          openSignInWindow('/auth/outlook/connect', 'SignInWindow');
          return false;
        }}
        styleName="connect-btn"
      >
        {/* <MicrosoftIcon width="20" height="20" />
        <span>Connect Microsoft</span> */}
        <img
          src={microsoftLogo}
          alt="Microsoft logo"
          styleName="connect-btn-logo"
        />
      </a>
    );
  } else if (provider === 'imap') {
    return (
      <>
        <a onClick={() => openImapModal('icloud')} styleName="connect-btn">
          <img
            src={icloudLogo}
            alt="iCloud logo"
            styleName="connect-btn-logo"
          />
        </a>
        <a onClick={() => openImapModal('fastmail')} styleName="connect-btn">
          <img
            src={fastmailLogo}
            alt="Fastmail logo"
            styleName="connect-btn-logo"
          />
        </a>
        <a onClick={() => openImapModal('aol')} styleName="connect-btn">
          <img src={aolLogo} alt="AOL logo" styleName="connect-btn-logo" />
        </a>
        <a onClick={() => openImapModal('yahoo')} styleName="connect-btn">
          <img src={yahooLogo} alt="Yahoo logo" styleName="connect-btn-logo" />
        </a>
        <a onClick={() => openImapModal()} styleName="connect-btn">
          <AtSignIcon width="20" height="20" />
          <span>Other...</span>
        </a>
      </>
    );
  } else {
    return null;
  }
};
