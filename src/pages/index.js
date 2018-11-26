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
            <Link
              as="a"
              to="/subscribe"
              onMouseEnter={() => setActive(true)}
              onMouseLeave={() => setActive(false)}
              className={`beam-me-up-cta beam-me-up-cta--${gender}`}
            >
              Sign me up!
            </Link>

            <a className="more-info" onClick={scrollDown}>
              Read more 👇
            </a>
          </div>
        </div>
        <div className="privacy">
          {/* <span className="falling-emoji">🙅‍♀️</span> */}
          <div>
            <h2>Unsubscribe with a single click</h2>
            <p>
              See all of your subscription emails in one place and unsubscribe
              from them easily!
            </p>
            <div className="example-img">
              <img src={gif} alt="unsubscribe list" />
            </div>

            <h2 className="privacy-title">We value your privacy!</h2>
            <span className="privacy-padlock">🕵️‍♀️</span>
            <p className="privacy-stuff">
              Unlike{' '}
              <a href="https://www.nytimes.com/2017/04/24/technology/personal-data-firm-slice-unroll-me-backlash-uber.html">
                others
              </a>
              , we'll never compromise your privacy. When we scan your inbox for
              subscriptions we{' '}
              <strong>
                never store any metadata or content of your emails on our
                servers.
              </strong>
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
              <img alt="picture-of-us!" src={dogs} />
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
