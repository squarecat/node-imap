import './connect.module.scss';

import { AtSignIcon, GoogleIcon, MicrosoftIcon } from '../icons';
import React, { useCallback, useContext, useEffect, useRef } from 'react';

import ImapModal from '../modal/imap';
import { ModalContext } from '../../providers/modal-provider';

// import aolLogo from '../../assets/providers/imap/aol-logo.png';
// import fastmailLogo from '../../assets/providers/imap/fastmail-logo.png';
// import icloudLogo from '../../assets/providers/imap/icloud-logo.png';
// import yahooLogo from '../../assets/providers/imap/yahoo-logo.png';

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
  // const prevModal = useRef(modal);
  useEffect(() => {
    return function cleanup() {
      window.removeEventListener('message', receiveMessage);
    };
  });
  const openImapModal = useCallback(
    () => {
      replaceModal(<ImapModal onConfirm={onSuccess} />, {
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
        <GoogleIcon width="20" height="20" />
        <span>Connect Google</span>
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
        <MicrosoftIcon width="20" height="20" />
        <span>Connect Microsoft</span>
      </a>
    );
  } else if (provider === 'imap') {
    return (
      <a onClick={openImapModal} styleName="connect-btn">
        <AtSignIcon width="20" height="20" />
        <span>Connect Other</span>
      </a>
      // <div styleName="other-btns">
      //   <a onClick={openImapModal} styleName="connect-btn imap">
      //     <img
      //       src={icloudLogo}
      //       alt="iCloud logo"
      //       styleName="connect-btn-logo"
      //     />
      //   </a>
      //   <a onClick={openImapModal} styleName="connect-btn imap">
      //     <img src={aolLogo} alt="AOL logo" styleName="connect-btn-logo" />
      //   </a>
      //   <a onClick={openImapModal} styleName="connect-btn imap">
      //     <img
      //       src={fastmailLogo}
      //       alt="Fastmail logo"
      //       styleName="connect-btn-logo"
      //     />
      //   </a>
      //   <a onClick={openImapModal} styleName="connect-btn imap">
      //     <img src={yahooLogo} alt="Yahoo logo" styleName="connect-btn-logo" />
      //   </a>
      //   <a onClick={openImapModal} styleName="connect-btn imap">
      //     <AtSignIcon width="20" height="20" />
      //     <span>Other...</span>
      //   </a>
      // </div>
    );
  } else {
    return null;
  }
};
