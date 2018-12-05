import React from 'react';

import logo from '../../assets/envelope-logo.png';
import './welcome.css';

const tweetText = encodeURIComponent(
  `🙌 I've been beta testing @LeaveMeAloneApp and it's the best because... \n\nCheck it out at https://leavemealone.xyz`
);

export default ({ openPriceModal }) => {
  return (
    <>
      <div>
        <div className="first-logon-content">
          <h2>Let's get started!</h2>
          <p className="beta-text">Thanks for joining the Beta!</p>
          <p className="beta-text">
            We hope you enjoy our product and that it can help you. If you have
            any feedback at all please let us know, and enjoy your clean inbox!{' '}
          </p>
          <p className="beta-text">
            Please also help us spread the word on social media by{' '}
            <a
              target="_"
              href={`https://twitter.com/intent/tweet?text=${tweetText}`}
            >
              tweeting about your experience
            </a>
            , this will go a long way to help us!
          </p>
          <p>
            <strong>Leave Me Alone</strong> will scan your Gmail inbox, and find
            all the subscripion emails that you are receiving.
          </p>
          <div className="">
            <img src={logo} className="first-logon-image" />
          </div>
          <p>
            You can then choose if you want to stay subscribed, or cancel the
            subscription.
          </p>
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
