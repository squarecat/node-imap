import React, { useRef } from 'react';

import gmailLogo from '../assets/gmail.png';
import dogs from '../assets/dogs.jpg';
import girlLogo from '../assets/leavemealonegirl.png';
import gif from '../assets/toggle-unsubscribe-hd.gif';

import Colin from '../components/squarecat';
import Layout from '../layouts/layout';

import './home.css';

const indieMakerTweetText = encodeURIComponent(
  `🙌 I'm supporting products made with love 💛 by Indie Makers @dinkydani21 and @JamesIvings. They're building @LeaveMeAloneApp 🙅‍♀️ - see all your subscription emails in one place and unsubscribe from them with a single click.\n\nCheck it out at https://leavemealone.xyz`
);

const IndexPage = () => {
  const activeRef = useRef(null);
  const setActive = isActive => {
    activeRef.current.classList[isActive ? 'add' : 'remove']('active');
  };

  const scrollDown = () => {
    window.scrollTo({
      top: window.innerHeight - 100,
      left: 0,
      behavior: 'smooth'
    });
  };
  return (
    <Layout>
      <Colin />
      <div id="main">
        <div className="friendly-neighbourhood-hero">
          <div>
            <h1>
              <div className="leave-me-alone-logo" ref={activeRef}>
                <span>
                  <img
                    src={gmailLogo}
                    alt="gmail-logo"
                    className="gmail-logo"
                  />
                </span>
                <span className="logo-emoji">
                  <img src={girlLogo} alt="girl-logo" className="girl-logo" />
                </span>
              </div>
            </h1>
            <h2 className="title">Leave Me Alone!</h2>
            <p className="catchy-tagline">
              Take back control of your inbox by telling subscription spammers
              to leave you alone!
            </p>
            <a
              href="/subscribe"
              onMouseEnter={() => setActive(true)}
              onMouseLeave={() => setActive(false)}
              className={`beam-me-up-cta beam-me-up-cta--f`}
            >
              Sign me up!
            </a>

            <a className="more-info" onClick={scrollDown}>
              Read more 👇
            </a>
          </div>
        </div>
        <div className="privacy">
          <div>
            <h2>Unsubscribe with a single click</h2>
            <p>
              Did you know that in 2018, spam messages account for 48.16% of all
              e-mail traffic worldwide?{' '}
              <sub className="privacy-source-ref">[1]</sub>
            </p>
            <p>
              See all of your subscription emails in one place and unsubscribe
              from them easily.
            </p>
            <cite className="privacy-source">
              [1]:{' '}
              <a href="https://www.statista.com/statistics/420391/spam-email-traffic-share/">
                Global spam volume as percentage of total e-mail traffic from
                January 2014 to March 2018, by month
              </a>
            </cite>
            <div className="example-img">
              <img src={gif} alt="unsubscribe list" />
            </div>

            <h2 className="privacy-title">We don't steal your data</h2>
            <span className="privacy-padlock">🕵️‍♀️</span>
            <p className="privacy-stuff">
              We'll NEVER compromise your privacy. When we scan your inbox for
              subscriptions, we{' '}
              <strong>never store any of your emails on our servers.</strong>
            </p>
            <p>
              Although services like this exist already, they make money by
              selling and marketing your information. You can read more about
              this on{' '}
              <a href="https://www.nytimes.com/2017/04/24/technology/personal-data-firm-slice-unroll-me-backlash-uber.html">
                The New York Times
              </a>
              ,{' '}
              <a href="https://lifehacker.com/unroll-me-the-email-unsubscription-service-has-been-c-1794593445">
                Life Hacker
              </a>
              ,{' '}
              <a href="https://www.wired.com/2017/04/stop-services-like-unroll-snooping-gmail/">
                Wired
              </a>
              ,{' '}
              <a href="https://techcrunch.com/2018/05/05/unroll-me-to-close-to-eu-users-saying-it-cant-comply-with-gdpr/">
                TechCrunch
              </a>
              ,{' '}
              <a href="https://www.cnet.com/how-to/how-to-remove-unroll-me-from-your-gmail-account/">
                CNET
              </a>
              , and{' '}
              <a href="https://www.theguardian.com/technology/2017/apr/24/unrollme-mail-unsubscription-service-heartbroken-sells-user-inbox-data-slice">
                The Guardian
              </a>
              .
            </p>
            <p>
              We promise to never exploit you or your data. We only want to help
              you regain control of your inbox.
            </p>
          </div>
        </div>
        <div className="makers">
          <div>
            <h2>Created by Independent Makers</h2>
            <p className="maker-stuff">
              Hey! 👋 We're Danielle and James. We work on products that help
              people because it's rewarding and we love it, which we think is a
              good reason to do just about anything! ❤️
            </p>
            <div className="huskos">
              <img alt="picture-of-us!" id="emoji-button" src={dogs} />
            </div>

            <p className="maker-stuff">
              We're building <strong>Leave Me Alone</strong> on our own without
              funding or outside support. We're real people (not the huskies!),
              we're not a soulless corporation out to steal your money! 🙅‍
            </p>
            <p>
              <a
                target="_"
                href={`https://twitter.com/intent/tweet?text=${indieMakerTweetText}`}
              >
                Support the Indie Maker movement!
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="footer">
        <ul className="footer-nav">
          <li>
            <a className="footer-link" href="/privacy">
              Privacy
            </a>
          </li>
          <li>
            <a className="footer-link" href="/terms">
              Terms
            </a>
          </li>
          <li>
            <a
              className="footer-link"
              target="_blank"
              rel="noopener noreferrer"
              href="http://leavemealone.releasepage.co"
            >
              Releases
            </a>
          </li>
        </ul>
        <ul className="footer-social">
          <li title="@LeaveMeAloneApp">
            <a href="https://twitter.com/leavemealoneapp">
              <svg id="i-twitter" viewBox="0 0 64 64" width="20" height="20">
                <path
                  strokeWidth="0"
                  fill="currentColor"
                  d="M60 16 L54 17 L58 12 L51 14 C42 4 28 15 32 24 C16 24 8 12 8 12 C8 12 2 21 12 28 L6 26 C6 32 10 36 17 38 L10 38 C14 46 21 46 21 46 C21 46 15 51 4 51 C37 67 57 37 54 21 Z"
                />
              </svg>
            </a>
          </li>
          <li title="leavemealone@squarecat.io">
            <a href="mailto:leavemealone@squarecat.io">
              <svg
                id="i-mail"
                viewBox="0 0 32 32"
                width="20"
                height="20"
                fill="none"
                stroke="currentcolor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <path d="M2 26 L30 26 30 6 2 6 Z M2 6 L16 16 30 6" />
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </Layout>
  );
};

export default IndexPage;
