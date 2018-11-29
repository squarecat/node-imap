import React, { useRef } from 'react';
import PageTransition from 'gatsby-plugin-page-transitions';

import logo from '../assets/leave-me-logo.png';
import Layout from '../layouts/layout';
import './login.css';

const tweetText = encodeURIComponent(
  `🙌 I've signed up for early access with @LeaveMeAloneApp to take back control of my inbox from spammers 🙅‍♀️ - subscribe now at https://leavemealone.xyz`
);

const SubscribePage = () => {
  const activeRef = useRef(null);
  const setActive = isActive => {
    activeRef.current.classList[isActive ? 'add' : 'remove']('active');
  };

  return (
    <PageTransition>
      <Layout>
        <div ref={activeRef} className="hold-onto-your-butts-we-are-logging-in">
          <div className="login-boxy-box">
            <div className="beautiful-logo">
              <img src={logo} alt="logo" />
            </div>
            <p>
              <strong>Leave Me Alone</strong> is not quite ready yet!
            </p>
            <p>
              Enter your email below to be the first notified when we launch!
            </p>
            {subscribe(setActive)}
          </div>
        </div>
      </Layout>
    </PageTransition>
  );
};

export default SubscribePage;

function subscribe(setActive) {
  return (
    <form
      action="https://squarecat.us16.list-manage.com/subscribe/post?u=cdadb0a9f5c77af011b1d5243&amp;id=c26f88c816"
      method="post"
      id="mc-embedded-subscribe-form"
      name="mc-embedded-subscribe-form"
      className="validate"
      target="_blank"
      noValidate
    >
      <div id="mc_embed_signup_scroll" className="signup">
        <div className="mc-field-group form-group">
          <input
            type="text"
            name="EMAIL"
            className="required email form-input"
            id="mce-EMAIL"
            required="required"
          />
          <label htmlFor="mce-EMAIL" className="form-label">
            Email Address
          </label>
        </div>
        <div id="mce-responses" className="clear">
          <div
            className="response"
            id="mce-error-response"
            style={{ display: 'none' }}
          />
          <div
            className="response"
            id="mce-success-response"
            style={{ display: 'none' }}
          />
        </div>
        <div
          style={{ position: 'absolute', left: '-5000px' }}
          aria-hidden="true"
        >
          <input
            type="text"
            name="b_cdadb0a9f5c77af011b1d5243_c26f88c816"
            tabIndex="-1"
          />
        </div>
        <div className="clear">
          <input
            onMouseEnter={() => setActive(true)}
            onMouseLeave={() => setActive(false)}
            type="submit"
            value="Subscribe"
            name="subscribe"
            id="mc-embedded-subscribe"
            className="button btn centered"
          />
        </div>
        <div className="tweet">
          <p>
            P.S.{' '}
            <a
              target="_"
              href={`https://twitter.com/intent/tweet?text=${tweetText}`}
            >
              Tweet us
            </a>{' '}
            for a special early bird discount!
          </p>
        </div>
      </div>
    </form>
  );
}
