import React from 'react';

import logo from '../../assets/envelope-logo.png';
import gif from '../../assets/toggle-unsubscribe-hd.gif';
import './welcome.css';

const betaTweetText = encodeURIComponent(
  `🙌 I've been beta testing @LeaveMeAloneApp and it's the best because... \n\nCheck it out at https://leavemealone.xyz`
);

export default ({ openPriceModal, isBeta }) => {
  return (
    <>
      <div>
        <div className="first-logon-content">
          <h2>Let's get started!</h2>
          {isBeta ? (
            <>
              <p className="beta-text">Thanks for joining!</p>
              <p className="beta-text">
                We hope you enjoy our product and that it can help you. If you
                have any feedback at all please let us know, and enjoy your
                clean inbox!{' '}
              </p>
              <p className="beta-text">
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
            <strong>Leave Me Alone</strong> will scan your Gmail inbox, and find
            all the subscripion emails that you are receiving.
          </p>
          <div className="welcome-logo">
            <img src={logo} alt="logo" className="first-logon-image" />
          </div>
          <p>
            We'll show you all the mail you are subscribed to, just hit the
            slider to unsubscribe.
          </p>
          <img src={gif} className="unsub-gif" alt="unsubscribe-gif" />
        </div>
        <div className="action">
          <a
            className={'btn centered'}
            onClick={() => {
              openPriceModal();
            }}
          >
            Scan my inbox
          </a>
        </div>
      </div>
    </>
  );
};
