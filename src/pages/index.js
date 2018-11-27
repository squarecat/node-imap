import React, { useRef, useEffect } from 'react';
import { Link } from 'gatsby';

import gmailLogo from '../assets/gmail.png';
import dogs from '../assets/dogs.jpg';
import Colin from '../components/squarecat';
import Layout from '../components/layout';
import gif from '../assets/toggle-unsubscribe-hd.gif';

import './home.css';

const IndexPage = () => {
  const gender = 'f';
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
                  <img src={gmailLogo} alt="gmail-logo" />
                </span>
                <span className="logo-emoji">
                  {gender === 'f' ? '🙅‍♀' : '🙅‍♂️'}
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
              className={`beam-me-up-cta beam-me-up-cta--${gender}`}
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
              Did you know that in 2018 spam messages account for 48.16% of all
              e-mail traffic worldwide?{' '}
              <sub className="privacy-source-ref">[1]</sub>
            </p>
            <p>
              See all of your subscription emails in one place and unsubscribe
              from them easily!
            </p>
            <p className="privacy-source">
              [1]:{' '}
              <a href="https://www.statista.com/statistics/420391/spam-email-traffic-share/">
                Global spam volume as percentage of total e-mail traffic from
                January 2014 to March 2018, by month
              </a>
            </p>
            <div className="example-img">
              <img src={gif} alt="unsubscribe list" />
            </div>

            <h2 className="privacy-title">We value your privacy</h2>
            <span className="privacy-padlock">🕵️‍♀️</span>
            <p className="privacy-stuff">
              We'll NEVER compromise your privacy. When we scan your inbox for
              subscriptions we{' '}
              <strong>never store any of your emails on our servers.</strong>
            </p>
            <p>
              Although a service like this exists already,{' '}
              <a href="https://www.nytimes.com/2017/04/24/technology/personal-data-firm-slice-unroll-me-backlash-uber.html">
                they make money by selling and marketing your information
              </a>
              !
            </p>
            <p>
              We promise to never exploit you or your data. We only want to help
              you regain control of your inbox!
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
            <p>Support the Indie Maker movement!</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IndexPage;
