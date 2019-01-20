import React, { useRef, useEffect, useState } from 'react';
import 'isomorphic-fetch';
import numeral from 'numeral';
import AnimatedNumber from 'react-animated-number';
import TrackVisibility from 'react-on-screen';

import { useAsync } from '../utils/hooks';
import envelope from '../assets/envelope.png';
import dogs from '../assets/dogs.jpg';
import girlLogo from '../assets/leavemealonegirl.png';
import smallLogo from '../assets/envelope-logo.png';
import gif from '../assets/toggle-unsubscribe-hd.gif';

import Colin from '../components/squarecat';
import Layout from '../layouts/layout';
import Footer from '../components/footer';
import WallOfLove from '../components/wall-of-love/wall-of-love';
import GiftsPayment from '../components/gifts/gifts';

import './home.css';

const indieMakerTweetText = encodeURIComponent(
  `🙌 I'm supporting products made with love 💛 by Indie Makers @dinkydani21 and @JamesIvings. They're building @LeaveMeAloneApp 🙅‍♀️ - see all your subscription emails in one place and unsubscribe from them with a single click.\n\nCheck it out at https://leavemealone.xyz`
);

import { PRICES as modalPrices } from '../components/price-modal';
const PRICES = modalPrices.map(p =>
  p.price === 800 ? { ...p, recommended: true } : p
);

const IndexPage = () => {
  const activeRef = useRef(null);
  const setActive = isActive => {
    activeRef.current.classList[isActive ? 'add' : 'remove']('active');
  };

  useEffect(() => {
    [...document.querySelectorAll('twitter-widget')].forEach(e => {
      const style = document.createElement('style');
      style.innerHTML = `
    .Tweet-card {
      display: none;
    }`;
      e.shadowRoot.appendChild(style);
    });
  }, []);

  const { error: statsError, loading: statsLoading, value } = useAsync(
    fetchStats
  );
  let statsData = { users: 0, unsubscriptions: 0 };
  if (!statsLoading) {
    statsData = value;
  }
  return (
    <Layout>
      <Colin />
      <div id="main">
        <div className="home-header">
          <div className="home-header-inner">
            <a href="/" className="home-header-logo">
              <img alt="logo" src={smallLogo} />
            </a>
            <div className="home-header-title">Leave Me Alone </div>
            <ul className="home-header-nav">
              <li>
                <a className="link" href="#how-it-works">
                  How it works
                </a>
              </li>
              <li>
                <a className="link" href="#pricing">
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="/app"
                  onMouseEnter={() => setActive(true)}
                  onMouseLeave={() => setActive(false)}
                  className={`beam-me-up-cta beam-me-up-cta--header`}
                >
                  Log in
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="friendly-neighbourhood-hero">
          <div className="hero-inner">
            <div className="hero-box hero-left">
              <div className="leave-me-alone-logo" ref={activeRef}>
                <span className="logo-envelope">
                  <img src={envelope} alt="gmail-logo" className="gmail-logo" />
                </span>
                <span className="logo-emoji">
                  <img src={girlLogo} alt="girl-logo" className="girl-logo" />
                </span>
              </div>
              <h1 className="title">Leave Me Alone</h1>
            </div>
            <div className="hero-box hero-right">
              <p className="catchy-tagline">
                Privacy Focused Email Unsubscription Service
              </p>
              <p>
                Take back control of your inbox by telling subscription spammers
                to leave you alone.
              </p>

              <div className="join-container">
                <a
                  href="/login"
                  onMouseEnter={() => setActive(true)}
                  onMouseLeave={() => setActive(false)}
                  className={`beam-me-up-cta beam-me-up-cta--f`}
                >
                  Get Started For Free!
                </a>
                {!statsError ? (
                  <p
                    className={`join-text ${
                      statsLoading ? 'join-text-loading' : ''
                    }`}
                  >
                    Join{' '}
                    <span className="join-stat">
                      {formatNumber(statsData.users)} users
                    </span>{' '}
                    who have unsubscribed from a total of{' '}
                    <span className="join-stat">
                      {formatNumber(statsData.unsubscriptions)} spam
                    </span>{' '}
                    emails
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          <a
            className="more-info"
            href="#how-it-works"
            // onClick={() => scrollToElement('how-it-works', 125)}
          >
            Read more 👇
          </a>
        </div>
        <div className="privacy home-container">
          <div className="home-container-inner" id="how-it-works">
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

            <TrackVisibility>
              {({ isVisible }) => (
                <Stats
                  isLoading={statsLoading}
                  data={statsData}
                  isVisible={isVisible}
                />
              )}
            </TrackVisibility>

            <h2 className="privacy-title">We don't steal your data</h2>
            <span className="privacy-padlock">🕵️‍♀️</span>
            <p>
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
        <div className="love home-container">
          <div className="home-container-inner" id="wall-of-love">
            <WallOfLove />
          </div>
        </div>
        <div className="pricing home-container">
          <div className="home-container-inner" id="pricing">
            <h2>Let's talk money</h2>
            <p>
              So that we can{' '}
              <span className="text-important">keep your data safe</span> Leave
              Me Alone is a paid service.
            </p>
            <p>
              You <span className="text-important">pay once</span> for how far
              back in time you want search your inbox for subscription emails.
            </p>
            {/* <p>
              We’ll scan your inbox for any subscription emails received in the{' '}
              <span className="text-important">last 3 days for free</span>.
            </p>
            <p>
              To scan for email subscriptions received in the{' '}
              <span className="text-important">
                last week, last month, or last 6 months
              </span>
              , you can make a one-time purchase of one of these packages.
            </p> */}
          </div>

          <div className="pricing-list-of-boxes-that-say-how-much">
            <p className="pricing-scan-text">
              Search your inbox for subscriptions received in the last...
            </p>
            <div className="a-load-of-boxes-with-prices">
              <a className="pricing-box" href="/login">
                <h3 className="pricing-title">3 days</h3>
                <p className="pricing-price">Free</p>
                <span className="pricing-text">no credit card required</span>
              </a>
              {PRICES.map(p => (
                <a
                  key={p.value}
                  className={`pricing-box ${
                    p.recommended ? 'pricing-box-recommended' : ''
                  }`}
                  href="/login"
                >
                  <h3 className="pricing-title">{p.label}</h3>
                  <p className="pricing-price">
                    {p.price ? `$${p.price / 100}` : 'Free'}
                  </p>
                  <span className="pricing-text">one-time payment</span>
                </a>
              ))}
            </div>
          </div>

          <div className="home-container-inner">
            <div className="pricing-cta">
              <ul className="bullets">
                <li>
                  See all of your subscription emails in{' '}
                  <span className="text-important">one place</span>
                </li>
                <li>
                  Unsubscribe from spam with a{' '}
                  <span className="text-important">single click</span>
                </li>
                <li>
                  Know your data is in{' '}
                  <span className="text-important">safe hands</span>
                </li>
                <li>
                  Enjoy a <span className="text-important">cleaner inbox</span>
                </li>
              </ul>
              <a
                href="/login"
                onMouseEnter={() => setActive(true)}
                onMouseLeave={() => setActive(false)}
                className={`beam-me-up-cta beam-me-up-cta--f`}
              >
                Get Started For Free!
              </a>
            </div>
          </div>
        </div>
        <div className="gifts home-container">
          <div className="home-container-inner" id="gifts">
            <h2>Gift a clean inbox</h2>
            <span className="container-emoji">🎁</span>
            <p>
              Increase your{' '}
              <span className="text-important">team's productivity</span>.
            </p>
            <p>
              Give your loved one{' '}
              <span className="text-important">fewer email notifications</span>.
            </p>
            <p>
              Help your mom{' '}
              <span className="text-important">ditch the spam</span>.
            </p>
            <p>
              Just a few great reasons to buy a gift scan of Leave Me Alone
              today!
            </p>
            <GiftsPayment prices={PRICES} />
          </div>
        </div>
        <div className="makers home-container">
          <div className="home-container-inner" id="about">
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
      <Footer />
      <div className="makerads-container">
        <p>Other indie made products we support</p>
        <iframe
          style={{ border: 0, width: '320px', height: '144px' }}
          src="https://makerads.xyz/ad"
        />
      </div>
    </Layout>
  );
};

function fetchStats() {
  return fetch('/api/stats').then(r => r.json());
}

function Stats({ isLoading, data, isVisible }) {
  const [stats, setStats] = useState({
    unsubscribableEmails: 0,
    unsubscriptions: 0
  });

  useEffect(
    () => {
      if (!isLoading && isVisible) {
        const {
          unsubscribableEmails,
          unsubscriptions,
          previouslyUnsubscribedEmails
        } = data;
        setStats({
          unsubscribableEmails:
            unsubscribableEmails - previouslyUnsubscribedEmails,
          unsubscriptions,
          set: true
        });
      }
    },
    [isVisible]
  );

  return (
    <div className="stats">
      <div className="stat">
        <span className="stat-value">
          <AnimatedNumber
            value={stats.unsubscribableEmails}
            style={{
              transition: '0.8s ease-out',
              fontSize: 48
            }}
            duration={1000}
            formatValue={n => formatNumber(n)}
          />
        </span>
        <span>Spam emails scanned</span>
      </div>
      <div className="stat">
        <span className="stat-value">
          <AnimatedNumber
            value={stats.unsubscriptions}
            style={{
              transition: '0.8s ease-out',
              fontSize: 48
            }}
            duration={1000}
            formatValue={n => formatNumber(n)}
          />
        </span>
        <span>Spam emails unsubscribed</span>
      </div>
    </div>
  );
}

export default IndexPage;

function formatNumber(n) {
  return n > 99999 ? numeral(n).format('0a') : numeral(n).format('0,0');
}
