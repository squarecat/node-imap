import './welcome.module.scss';

import Button from '../../components/btn';
import React from 'react';
import _capitalize from 'lodash.capitalize';
import gif from '../../assets/toggle-unsubscribe-hd.gif';

const logoUrl = `${process.env.CDN_URL}/images/meta/logo.png`;

const betaTweetText = encodeURIComponent(
  `🙌 I've been beta testing @LeaveMeAloneApp and it's the best because... \n\nCheck it out at https://leavemealone.xyz`
);

export default ({ openPriceModal, isBeta = false, provider } = {}) => {
  return (
    <>
      <div styleName="first-logon-content">
        <h2>Let's get started!</h2>
        {isBeta ? (
          <>
            <p styleName="beta-text">Thanks for joining!</p>
            <p styleName="beta-text">
              We hope you enjoy our product and that it can help you. If you
              have any feedback at all please let us know, and enjoy your clean
              inbox!{' '}
            </p>
            <p styleName="beta-text">
              Please also help us spread the word on social media by{' '}
              <a
                target="_"
                href={`https://twitter.com/intent/tweet?text=${betaTweetText}`}
              >
                tweeting about your experience
              </a>
              , this will go a long way to help us!
            </p>
          </>
        ) : null}
        <p>
          <strong>Leave Me Alone</strong> will scan your{' '}
          <span styleName="provider">{_capitalize(provider)}</span> inbox, and
          find all the subscription emails that you are receiving.
        </p>
        <div styleName="welcome-logo">
          <img src={logoUrl} alt="logo" styleName="first-logon-image" />
        </div>
        <p>
          We'll show you all the mail you are subscribed to, just hit the slider
          to unsubscribe.
        </p>
        <img src={gif} styleName="unsub-gif" alt="unsubscribe-gif" />
        <Button
          centered
          onClick={() => {
            openPriceModal();
          }}
        >
          Scan my inbox
        </Button>
      </div>
    </>
  );
};
