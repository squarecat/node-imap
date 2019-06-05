import 'isomorphic-fetch';
import './home.scss';

import { ENTERPRISE, USAGE_BASED, getPackage } from '../utils/prices';
import { GoogleIcon, OutlookIcon } from '../components/icons';
import React, { useRef, useState } from 'react';
import { TextImportant, TextLink } from '../components/text';

import Browser from '../components/browser';
import Colin from '../components/squarecat';
import Footer from '../components/footer';
import Header from '../components/landing/header';
import Layout from '../layouts/layout';
import { Link } from 'gatsby';
import RangeInput from '../components/form/range';
import WallOfLove from '../components/landing/wall-of-love';
import dogs from '../assets/dogs.jpg';
import envelope from '../assets/envelope.png';
import girlLogo from '../assets/leavemealonegirl.png';
import heartGif from '../assets/heart.gif';
import iphoneUnsub from '../assets/iphone-unsub.png';
import mailBoxImg from '../assets/mailbox.png';
import numeral from 'numeral';
import onePlace from '../assets/in-one-place.png';
import packageImg from '../assets/package.png';
import request from '../utils/request';
import smallLogo from '../assets/envelope-logo.png';
import spamMailImg from '../assets/spam-email.png';
import stampImg from '../assets/stamp.png';
import truckImg from '../assets/truck.png';
import unsubGif from '../assets/unsub-btn.gif';
import unsubListGif from '../assets/unsubscribe-new.gif';
import { useAsync } from '../utils/hooks';

function getFeaturedNews() {
  return request('/api/news').then(data => data.filter(d => d.featured));
}

const IndexPage = ({ transitionStatus }) => {
  const activeRef = useRef(null);
  const setActive = isActive => {
    activeRef.current.classList[isActive ? 'add' : 'remove']('active');
  };

  const { error: statsError, loading: statsLoading, value } = useAsync(
    fetchStats
  );
  let statsData = { users: 0, unsubscriptions: 0 };
  if (!statsLoading) {
    statsData = value;
  }

  const { value: featuredNews = [] } = useAsync(getFeaturedNews);

  const bannerShown = false;

  return (
    <Layout>
      <Colin />
      <div id="main" data-status={transitionStatus}>
        <Header setActive={setActive} />
        <div
          className={`friendly-neighbourhood-hero ${
            bannerShown ? 'friendly-neighbourhood-hero-bannered' : ''
          }`}
        >
          <div className="hero-inner">
            <div className="hero-box hero-left">
              <div className="leave-me-alone-logo" ref={activeRef}>
                <span className="logo-envelope">
                  <img
                    src={envelope}
                    alt="Envelope logo"
                    className="gmail-logo"
                  />
                </span>
                <span className="logo-emoji">
                  <img
                    src={girlLogo}
                    alt="Girl gesturing no logo"
                    className="girl-logo"
                  />
                </span>
              </div>
              <h1 className="title">Leave Me Alone</h1>
            </div>
            <div className="hero-box hero-right">
              <div className="hero-right-inner">
                <p className="catchy-tagline">
                  Easily unsubscribe from spam emails
                </p>
                <p className="informative-description">
                  See all of your subscription emails in one place and
                  unsubscribe from them with a single click.
                </p>

                <div className="join-container">
                  <Link
                    to="/signup"
                    onMouseEnter={() => setActive(true)}
                    onMouseLeave={() => setActive(false)}
                    className={`beam-me-up-cta`}
                    state={{ register: true }}
                  >
                    Get Started For Free!
                  </Link>
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
          </div>
          <a className="more-info" href="#learn">
            Read more{' '}
            <span role="img" aria-label="Point down">
              👇
            </span>
          </a>
        </div>

        <div className="learn home-container">
          <div className="home-container-inner" id="learn">
            <h2 className="feature-header">
              See all of your spam, newsletters and subscription emails in one
              place.
            </h2>
            <div className="example-img">
              <img
                src={onePlace}
                className="unsub-desktop-img"
                alt="List of spam and subscription emails in Leave Me Alone on desktop"
              />
              <img
                src={iphoneUnsub}
                className="unsub-iphone-img"
                alt="List of spam and subscription emails in Leave Me Alone on mobile"
              />
            </div>
            <div className="features">
              <div className="feature-a">
                <h3 className="feature-title">
                  Unsubscribe with a single click
                </h3>
                <div className="feature-img unsub">
                  <img
                    src={unsubGif}
                    alt="Unsubscribing from a subscription list by clicking the toggle"
                  />
                </div>
              </div>
              <div className="feature-b">
                <h3 className="feature-title">Keep your favorite senders</h3>
                <div className="feature-img favorite">
                  <img
                    src={heartGif}
                    alt="Adding a sender to favorites by clicking the heart"
                  />
                </div>
              </div>
            </div>
            <div className="learn-providers" id="providers">
              <h2 className="providers-header">
                Unsubscribe from unwanted emails in Gmail and Outlook
              </h2>
              <p>
                We support Google and Microsoft email accounts including Gmail,
                G Suite, Outlook, Live, and Hotmail.
              </p>
              <div className="provider-logos">
                <span className="provider-logo">
                  <GoogleIcon width="60" height="60" />
                </span>
                <span className="provider-logo">
                  <OutlookIcon width="60" height="60" />
                </span>
              </div>
              <div className="provider-stats">
                <p>
                  <span className="provider-stats-num">
                    {formatNumber(statsData.users)}
                  </span>{' '}
                  users worldwide
                </p>
                <p>
                  <span className="provider-stats-num">
                    {formatNumber(statsData.unsubscriptions)}
                  </span>{' '}
                  spam and subscription emails gone forever
                </p>
              </div>
              <div className="unsub-list-img">
                <Browser>
                  <img
                    src={unsubListGif}
                    alt="Clicking the toggle to unsubscribe from a mailing list"
                  />
                </Browser>
              </div>
              <a
                href="/login"
                onMouseEnter={() => setActive(true)}
                onMouseLeave={() => setActive(false)}
                className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert`}
              >
                Start unsubscribing
              </a>
            </div>
          </div>
        </div>

        {/* <div className="providers home-container">
          <div className="home-container-inner" id="providers">
            <h2>Where it works</h2>
            <div className="provider-logos">
              <span>
                <GoogleIcon />
              </span>
              <span>
                <OutlookIcon />
              </span>
            </div>
            <p>{formatNumber(statsData.users)} users worldwide.</p>
            <p>
              {formatNumber(statsData.unsubscriptions)} spam and subscription
              emails gone forever.
            </p>
          </div>
        </div> */}

        <div className="privacy home-container">
          <div className="home-container-inner" id="learn">
            {/* <p>
              Did you know that in 2018, spam messages account for 48.16% of all
              e-mail traffic worldwide?{' '}
              <sub className="privacy-source-ref">[1]</sub>
            </p>
            <p>
              Leave Me Alone lets you see all of your subscription emails in one
              place and unsubscribe from them easily.
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
            </div> */}

            <h2 className="privacy-title">Why us?</h2>
            {/* <span className="privacy-padlock">🕵️‍♀️</span> */}
            <p>
              Other unsubscription services have existed for years, however they
              make money by selling and marketing your information. You can read
              more about this on{' '}
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
            <p className="privacy-padlock">🕵️‍♀️</p>
            <p>
              We won't EVER sell your data (in fact we don't even store any
              email content). We actually unsubscribe you from emails rather
              than just moving them to trash, so those subscriptions are gone
              forever, even if you decide to stop using our service.
            </p>
            <p>No hidden fees. No lock-in.</p>
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
              So that we can <TextImportant>keep your data safe</TextImportant>{' '}
              Leave Me Alone is a paid service.
            </p>
          </div>
          <Pricing />

          <div className="home-container-inner">
            <div className="pricing-cta">
              <ul className="bullets">
                <li>
                  See all of your subscription emails in{' '}
                  <TextImportant>one place</TextImportant>
                </li>
                <li>
                  Unsubscribe from spam with a{' '}
                  <TextImportant>single click</TextImportant>
                </li>
                <li>
                  Know your data is in <TextImportant>safe hands</TextImportant>
                </li>
                <li>
                  Enjoy a <TextImportant>cleaner inbox</TextImportant>
                </li>
              </ul>
              <a
                href="/login"
                onMouseEnter={() => setActive(true)}
                onMouseLeave={() => setActive(false)}
                className={`beam-me-up-cta beam-me-up-cta-center`}
              >
                Try for Free
              </a>
            </div>
          </div>
        </div>

        <div className="news home-container">
          <div className="home-container-inner" id="news">
            <h2>In The News</h2>
            <div className="in-the-news">
              {featuredNews.map(({ quote, shortQuote, logoUrl, url }) => (
                <div key={url} className="news-item">
                  <p>"{shortQuote || quote}"</p>
                  <a target="_" className="news-logo" href={url}>
                    <img src={logoUrl} />
                  </a>
                </div>
              ))}
            </div>
            <TextLink href="/news">Read more...</TextLink>
          </div>
        </div>

        <div className="makers home-container">
          <div className="home-container-inner" id="about">
            <h2>Created by Independent Makers</h2>
            <p className="maker-stuff">
              Hey!{' '}
              <span role="img" aria-label="Wave">
                👋
              </span>{' '}
              We're Danielle and James. We work on products that help people
              because it's rewarding and we love it, which we think is a good
              reason to do just about anything!{' '}
              <span role="img" aria-label="Heart">
                ❤️
              </span>
            </p>
            <div className="huskos">
              <img
                alt="The two creators Danielle and James with two husky dogs"
                id="emoji-button"
                src={dogs}
              />
            </div>

            <p className="maker-stuff">
              We're building <strong>Leave Me Alone</strong> on our own without
              funding or outside support. We're real people (not the huskies!),
              we're not a soulless corporation out to steal your money!
            </p>
            <a href="/login" className={`beam-me-up-cta beam-me-up-cta-center`}>
              Clean My Inbox!
            </a>
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
      </div>
    </Layout>
  );
};

function fetchStats() {
  return request('/api/stats');
}

// function Stats({ isLoading, data, isVisible }) {
//   const [stats, setStats] = useState({
//     unsubscribableEmails: 0,
//     unsubscriptions: 0
//   });

//   useEffect(
//     () => {
//       if (!isLoading && isVisible) {
//         const {
//           unsubscribableEmails,
//           unsubscriptions,
//           previouslyUnsubscribedEmails
//         } = data;
//         setStats({
//           unsubscribableEmails:
//             unsubscribableEmails - previouslyUnsubscribedEmails,
//           unsubscriptions,
//           set: true
//         });
//       }
//     },
//     [isVisible]
//   );

//   return (
//     <div className="stats">
//       <div className="stat">
//         <span className="stat-value">
//           <AnimatedNumber
//             value={stats.unsubscribableEmails}
//             style={{
//               transition: '0.8s ease-out',
//               fontSize: 48
//             }}
//             duration={1000}
//             formatValue={n => formatNumber(n)}
//           />
//         </span>
//         <span>Spam emails scanned</span>
//       </div>
//       <div className="stat">
//         <span className="stat-value">
//           <AnimatedNumber
//             value={stats.unsubscriptions}
//             style={{
//               transition: '0.8s ease-out',
//               fontSize: 48
//             }}
//             duration={1000}
//             formatValue={n => formatNumber(n)}
//           />
//         </span>
//         <span>Spam emails unsubscribed</span>
//       </div>
//     </div>
//   );
// }

export default IndexPage;

function formatNumber(n) {
  return n > 999999 ? numeral(n).format('0a') : numeral(n).format('0,0');
}

function Pricing() {
  const [packageValue, setPackageValue] = useState('1');
  const [mailPerDay, setMailPerDay] = useState('20');

  let { unsubscribes, discount, price } = getPackage(packageValue);

  let mailPerDayLabel = '<10';
  if (parseInt(mailPerDay, 10) <= 10) {
    mailPerDayLabel = 'fewer than 10';
  } else if (parseInt(mailPerDay, 10) < 300) {
    mailPerDayLabel = mailPerDay;
  } else if (parseInt(mailPerDay, 10) >= 300) {
    mailPerDayLabel = '300+';
  }
  const mailPerMonth = mailPerDay === '0' ? 10 * 30 : mailPerDay * 30;
  const spamPerMonth = mailPerMonth * 0.08;
  const unsubsPerMonth = spamPerMonth * 0.36;
  let recommendation;
  let recommendationImage;
  if (unsubsPerMonth < 45) {
    recommendationImage = stampImg;
    recommendation = (
      <span>
        We recommend you start on the{' '}
        <TextImportant>Usage based plan</TextImportant>, if you receive more
        than 85 unwanted subscription emails then it would be better to switch
        to a package.
      </span>
    );
  } else if (unsubsPerMonth < 200) {
    recommendationImage = packageImg;
    recommendation = (
      <span>
        The cheapest option would be to buy a{' '}
        <TextImportant>Package</TextImportant> and get a bulk discount.
      </span>
    );
  } else {
    recommendationImage = truckImg;
    recommendation = (
      <span>
        Wow, that's a lot of emails! We recommend you contact us for a{' '}
        <TextImportant>special custom package</TextImportant> rate.
      </span>
    );
  }
  return (
    <>
      <div className="pricing-list-of-boxes-that-say-how-much">
        <div className="a-load-of-boxes-with-prices">
          <div className="pricing-box" href="/login">
            <h3 className="pricing-title">Usage Based</h3>
            <img className="pricing-image" src={stampImg} />
            <span className="pricing-text">Starting at</span>
            <p className="pricing-price">
              <span className="currency">$</span>
              {(USAGE_BASED.price / 100).toFixed(2)}
            </p>
            <span className="pricing-text">per unsubscribe</span>
            <ul className="pricing-features">
              <li>Gmail and Outlook support</li>
              <li data-checked="no">Limited API access</li>
              <li>Email forwarding</li>
              <li>Email and chat support</li>
            </ul>
          </div>
          <div className="pricing-box featured" href="/login">
            <h3 className="pricing-title">Packages</h3>
            <img className="pricing-image" src={packageImg} />
            <span className="pricing-text">Starting at</span>
            <p className="pricing-price">
              <span className="currency">$</span>
              <span>{(price / 100).toFixed(2)}</span>
            </p>
            <span className="pricing-text">
              for <span>{unsubscribes}</span> unsubscribes
            </span>
            <span className="pricing-slider">
              <RangeInput
                min="1"
                max="3"
                value={packageValue}
                onChange={val => setPackageValue(val)}
              />
            </span>
            <ul className="pricing-features">
              <li>
                <span>{discount * 100}</span>% bulk discount
              </li>
              <li>Gmail and Outlook support</li>
              <li>Limited API access</li>
              <li>Email forwarding</li>
              <li>Email and chat support</li>
            </ul>
          </div>
          <div className="pricing-box" href="/login">
            <h3 className="pricing-title">Enterprise</h3>
            <img className="pricing-image" src={truckImg} />
            <span className="pricing-text">Starting at</span>
            <p className="pricing-price">
              <span className="currency">$</span>
              {(ENTERPRISE.price / 100).toFixed(2)}
            </p>
            <span className="pricing-text">per month</span>
            <ul className="pricing-features">
              <li>Up to {ENTERPRISE.seats} seats</li>
              <li>Unlimited unsubscribes</li>
              <li>Gmail and Outlook support</li>
              <li>Limitless API access</li>
              <li>Email forwarding</li>
              <li>Email, chat and phone support</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="pricing-estimates">
        <div className="pricing-estimator">
          <div className="pricing-estimate-text">
            <h3 className="pricing-estimate-title">
              How many unsubscribes do I need?
            </h3>
            <p>
              Based on our usage data we can estimate how many unsubscribes you
              might need based on the size of your inbox.
            </p>
            <p>
              Approximately how much mail do you receive{' '}
              <TextImportant>each day?</TextImportant>
            </p>
            <RangeInput
              min="0"
              max="300"
              value={mailPerDay}
              step="20"
              onChange={setMailPerDay}
            />
            <div style={{ marginTop: 10 }}>{mailPerDayLabel}</div>
          </div>
          <div className="pricing-estimate-values">
            <div className="count">
              <div className="count-value">
                <div className="count-number">
                  {numeral(mailPerMonth).format('0,00')}
                </div>
                <div className="count-label">emails</div>
              </div>
              <div className="count-icon">
                <img src={mailBoxImg} />
              </div>
              <div className="count-description">
                You received approximately this many emails per month
              </div>
            </div>
            <div className="count">
              <div className="count-value">
                <div className="count-number">
                  {numeral(spamPerMonth).format('0,00')}
                </div>
                <div className="count-label">subscriptions</div>
              </div>
              <div className="count-icon">
                <img src={spamMailImg} />
              </div>
              <div className="count-description">
                Around 8% of all mail we scan is a subscription email
              </div>
            </div>
            <div className="count">
              <div className="count-value">
                <div className="count-number">
                  {numeral(unsubsPerMonth).format('0,00')}
                </div>
                <div className="count-label">unsubscribes</div>
              </div>
              <div className="count-icon">
                <img className="envelope-image" src={smallLogo} />
              </div>
              <div className="count-description">
                Users report around 36% of the subscriptions we find are
                unwanted
              </div>
            </div>
          </div>
        </div>
        <div className="recommendation">
          <div className="recommendation-image">
            <img src={recommendationImage} />
          </div>
          <div className="recommendation-description">
            <p>
              Based on your mail received, we estimate you'll have received
              around{' '}
              <TextImportant>
                {`${numeral(unsubsPerMonth).format(
                  '0,00'
                )} unwanted subscription emails `}
              </TextImportant>{' '}
              each month.
            </p>
            <p>{recommendation}</p>
          </div>
        </div>
      </div>
    </>
  );
}
