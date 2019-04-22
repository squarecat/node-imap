import 'isomorphic-fetch';
import './home.scss';

import React, { useRef } from 'react';

import Colin from '../components/squarecat';
import Footer from '../components/footer';
import Header from './header';
import Layout from '../layouts/layout';
import { TextImportant, TextLink } from '../components/text';
import WallOfLove from './wall-of-love';
import dogs from '../assets/dogs.jpg';
import envelope from '../assets/envelope.png';
import girlLogo from '../assets/leavemealonegirl.png';
import heartGif from '../assets/heart.gif';
import iphoneUnsub from '../assets/iphone-unsub.png';
import numeral from 'numeral';
import onePlace from '../assets/in-one-place.png';
import { PRICES as prices } from '../utils/prices';
import unsubGif from '../assets/unsub-btn.gif';
import { useAsync } from '../utils/hooks';

const PRICES = prices.map(p =>
  p.price === 800 ? { ...p, recommended: true } : p
);

function getFeaturedNews() {
  return fetch('/api/news')
    .then(resp => resp.json())
    .then(data => data.filter(d => d.featured));
}

const IndexPage = () => {
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

  const { value: featuredNews = [], loadingNews } = useAsync(getFeaturedNews);

  const bannerShown = false;

  return (
    <Layout>
      <Colin />
      <div id="main">
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
                  <img src={envelope} alt="gmail-logo" className="gmail-logo" />
                </span>
                <span className="logo-emoji">
                  <img src={girlLogo} alt="girl-logo" className="girl-logo" />
                </span>
              </div>
              <h1 className="title">Leave Me Alone</h1>
            </div>
            <div className="hero-box hero-right">
              <div className="hero-right-inner">
                <p className="catchy-tagline">
                  Take back control of your inbox
                </p>
                <p className="informative-description">
                  See all of your subscription emails in one place and
                  unsubscribe from them with a single click.
                </p>

                <div className="join-container">
                  <a
                    href="/login"
                    onMouseEnter={() => setActive(true)}
                    onMouseLeave={() => setActive(false)}
                    className={`beam-me-up-cta`}
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
          </div>
          <a className="more-info" href="#learn">
            Read more 👇
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
                alt="unsubscribe list"
              />
              <img
                src={iphoneUnsub}
                className="unsub-iphone-img"
                alt="unsubscribe list"
              />
            </div>
            <div className="features">
              <div className="feature-a">
                <h3 className="feature-title">
                  Unsubscribe with a single click
                </h3>
                <div className="feature-img unsub">
                  <img src={unsubGif} alt="unsub animation" />
                </div>
              </div>
              <div className="feature-b">
                <h3 className="feature-title">Keep your favorite senders</h3>
                <div className="feature-img favorite">
                  <img src={heartGif} alt="heart animation" />
                </div>
              </div>
            </div>
          </div>
        </div>

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
            <p>
              You <TextImportant>pay once</TextImportant> for how far back in
              time you want search your inbox for subscription emails.
            </p>
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
            <a className="pricing-enterprise" href="/enterprise">
              Looking for an enterprise plan?
            </a>
          </div>

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
                Get Started For Free!
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
  return fetch('/api/stats').then(r => r.json());
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
  return n > 99999 ? numeral(n).format('0a') : numeral(n).format('0,0');
}
