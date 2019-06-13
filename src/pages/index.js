import 'isomorphic-fetch';
import './home.scss';

import { ENTERPRISE, getPackage } from '../utils/prices';
import { GoogleIcon, OutlookIcon } from '../components/icons';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from 'react';
import { TextImportant, TextLink } from '../components/text';

import Browser from '../components/browser';
import Footer from '../components/footer';
import Header from '../components/landing/header';
import Layout from '../layouts/layout';
import { Link } from 'gatsby';
import RangeInput from '../components/form/range';
import Toggle from '../components/toggle';
import { Transition } from 'react-transition-group';
import WallOfLove from '../components/landing/wall-of-love';
import allSubscriptions from '../assets/all-subscriptions.png';
import dogs from '../assets/dogs.jpg';
import envelope from '../assets/open-envelope-love.png';
import heartGif from '../assets/heart.gif';
import mailBoxImg from '../assets/mailbox.png';
import numeral from 'numeral';
import packageImg from '../assets/package.png';
import request from '../utils/request';
import smallLogo from '../assets/envelope-logo.png';
import spamMailImg from '../assets/spam-email.png';
import stampImg from '../assets/stamp.png';
import subscriberScore from '../assets/subscriber-score.png';
import truckImg from '../assets/truck.png';
import unsubGif from '../assets/unsub-btn.gif';
import unsubListGif from '../assets/unsubscribe-new.gif';
import { useAsync } from '../utils/hooks';
import { useWindowSize } from 'react-use';

const faker = require('faker');

function getFeaturedNews() {
  return request('/api/news').then(data => data.filter(d => d.featured));
}

const IndexPage = ({ transitionStatus }) => {
  const trashPileRef = useRef(null);
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
      <div id="main" data-status={transitionStatus}>
        <Header setActive={() => {}} />
        <div
          className={`friendly-neighbourhood-hero ${
            bannerShown ? 'friendly-neighbourhood-hero-bannered' : ''
          }`}
        >
          <div className="hero-inner">
            <div className="hero-box hero-left">
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
            <div className="hero-box">
              <UnsubscribeDemo trashPileRef={trashPileRef.current} />
            </div>
          </div>
        </div>

        <div className="home-container">
          <div className="learn-1 boxed home-container-inner" id="learn">
            <div className="home-box text-box">
              <h3>All of your subscription emails together</h3>
              <p>
                Too much noise in your inbox? We show you all the mailing lists
                you're subscribed to and let you unsubscribe with one click.
              </p>
            </div>
            <div className="home-box item-box">
              <div className="image-box">
                <img
                  src={allSubscriptions}
                  className="all-unsubscriptions-img"
                  alt="subscriber score image"
                />
              </div>
            </div>
          </div>

          <div className="learn-2 boxed home-container-inner">
            <div className="home-box item-box">
              <div className="image-box">
                <img src={subscriberScore} alt="subscriber score image" />
              </div>
            </div>
            <div className="home-box text-box">
              <h3>Easily see what's worth your time</h3>
              <p>
                We rank each of your subscriptions based on our unique
                Subscriber Score, so you can quickly tell if it's worth hanging
                on to.
              </p>
            </div>
          </div>
          <div className="learn-1 boxed home-container-inner">
            <div className="home-box item-box">
              <div className="image-box">
                <img src={envelope} alt="private envelope image" />
              </div>
            </div>
            <div className="home-box text-box">
              <h3>Privacy first</h3>
              <p>
                We're committed to privacy. We don't store any email content so
                you don't have to worry about us losing or selling your data.
              </p>
            </div>
          </div>

          <div className="trash-pile" id="trash-pile">
            <div className="home-box text-box text-box-centered">
              <h3>Say goodbye to subscriptions forever</h3>
              <p>
                When you hit the unsubscribe button we don't just move your mail
                into a folder or to trash, instead we actually unsubscribe you
                from the list.
              </p>
              <p>
                This means the subscriptions are gone{' '}
                <TextImportant>forever</TextImportant>, even if you decide to
                stop using our service.
              </p>
            </div>
          </div>
        </div>

        <div className="learn-providers" ref={trashPileRef} id="providers">
          <div className="home-box text-box text-box-centered">
            <h3 className="providers-header">
              We support both Gmail and Outlook
            </h3>
            <p>
              If you have a Google or Microsoft email account then we have you
              covered. This includes Gmail, G Suite, Outlook, Live, and Hotmail.
            </p>
            <div className="provider-logos">
              <span className="provider-logo">
                <GoogleIcon width="60" height="60" />
              </span>
              <span className="provider-logo">
                <OutlookIcon width="60" height="60" />
              </span>
            </div>
            {/* <div className="provider-stats">
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
              </div> */}
            <a
              href="/login"
              className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert`}
            >
              Start unsubscribing
            </a>
          </div>
        </div>

        {/* <div className="love home-container">
          <div className="home-container-inner" id="wall-of-love">
            <WallOfLove />
          </div>
        </div> */}
        <div className="pricing home-container">
          <div className="home-container-inner" id="pricing">
            <h2>Let's talk money</h2>
            <p>
              So that we can <TextImportant>keep your data safe</TextImportant>{' '}
              Leave Me Alone is a paid service.
            </p>
          </div>
          <Pricing />
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

        {/* <div className="makers home-container">
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
        </div> */}
        <Footer />
        {/* <div className="makerads-container">
          <p>Other indie made products we support</p>
          <iframe
            style={{ border: 0, width: '320px', height: '144px' }}
            src="https://makerads.xyz/ad"
          />
        </div> */}
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
          {/* <div className="pricing-box" href="/login">
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
          </div> */}
          <div className="pricing-box" href="/login">
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
              <li className="coming-soon">Limited API access</li>
              <li className="coming-soon">Email forwarding</li>
              <li>Email and chat support</li>
            </ul>
          </div>
          <div className="pricing-box" href="/login">
            <h3 className="pricing-title">Enterprise</h3>
            <img className="pricing-image" src={truckImg} />
            <span className="pricing-text">Starting at</span>
            <p className="pricing-price">
              <span className="currency">$</span>
              {(ENTERPRISE.pricePerSeat / 100).toFixed(2)}
            </p>
            <span className="pricing-text">per seat/month</span>
            <ul className="pricing-features">
              <li>Rid your office of useless email</li>
              <li>Unlimited unsubscribes</li>
              <li>Gmail and Outlook support</li>
              <li className="coming-soon">Limitless API access</li>
              <li className="coming-soon">Email forwarding</li>
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

const items = [
  {
    name: 'Black Friday Cacti',
    email: '<marketing@cact.us>',
    subject: `🌵 One day only, 80% off your next cactus!`,
    text: "It's as simple as a single click. Go on, try it! ☝️"
  },
  {
    name: 'Mars Travel 🌝',
    email: '<marketing@travel.com>',
    subject: 'New price alert for your flight outa here - Book!',
    text: 'Wohoo, that subscription is gone forever! How about this one?'
  },
  {
    name: `Stanley's Snakes`,
    email: '<stanley@shadey.snake>',
    subject: `🐍 Big Snake Sale. Come on down to Snakes 'R' Us`,
    text: "Wow, that felt good! Don't worry there's always more!"
  },
  {
    name: 'Big Business',
    email: '<clark@business.com>',
    subject: `We know you don't care but we email you anyway`,
    text: 'Maybe we want to keep this one? Nahhhh only kidding! Ditch it!'
  },
  {
    name: 'Dull Time Tracker',
    email: '<noreply@tracker.co>',
    subject: `What have you been doing today? Probably nothing.`,
    text: 'Maybe we want to keep this one? Nahhhh only kidding! Ditch it!'
  },
  {
    name: 'Business Stuff',
    email: '<noti@fications.gov>',
    subject: `🚨 You have new notifications! Don't forget!`,
    text: 'Maybe we want to keep this one? Nahhhh only kidding! Ditch it!'
  }
];

const getMessage = count => {
  if (count < 10) {
    return 'Maybe we want to keep this one? Nahhhh only kidding! Ditch it!';
  }
  if (count < 15) {
    return 'Keep it up! Get rid of all of them!';
  }
  if (count < 25) {
    return `Holy moly you're dedicated! Maybe you should actually sign in and do this for real?`;
  }
  if (count < 100) {
    return `Okay you're pretty serious about this. But I bet you can't get to 100! You're at ${count}`;
  }
  if (count < 120) {
    return `Okay, okay, you win, please stop clicking.`;
  }
  if (count < 125) {
    return `Okay, okay, you win, PLEASE stop clicking!`;
  }
  if (count < 130) {
    return `Seriously, this is getting annoying now.`;
  }
  if (count < 140) {
    return `How about if I give you a discount? Then will you stop bothering me?`;
  }
  if (count < 150) {
    return (
      <span>
        Fine I will! Use the coupon{' '}
        <TextImportant>I_HATE_SUBSCRIPTIONS</TextImportant> for 5% off 💌
      </span>
    );
  }
  if (count < 175) {
    return `I hope you're happy. You wasted a whole bunch of time for a measly 5%.`;
  }
  if (count < 200) {
    return `Seriously, there's nothing more to gain now.`;
  }
  if (count < 225) {
    return `Nothing at all. Nope, definitely nothing left.`;
  }
  if (count < 250) {
    return `Okay I lied.... Or did I?`;
  }
  if (count < 320) {
    return (
      <span>
        ...Psst, you're awesome. Use the coupon{' '}
        <TextImportant>I_REALLY_HATE_SUBSCRIPTIONS</TextImportant> for a huge
        10% off 😍. Our little secret OK?
      </span>
    );
  }
};
function nodes(state, action) {
  switch (action.type) {
    case 'next': {
      const { count } = state;
      const newCount = count + 1;
      let newNode = items[newCount];
      if (!newNode) {
        const email = `noreply@${faker.internet.domainName()}`;
        newNode = {
          name: faker.name.findName(),
          email,
          text: getMessage(newCount)
        };
      }
      let nodes = state.nodes;
      // maximum of 50 nodes
      if (state.nodes.length > 100) {
        nodes = state.nodes.slice(1, state.nodes.length);
      }
      return {
        count: newCount,
        nodes: [...nodes, newNode]
      };
    }
    default:
      return state;
  }
}

function UnsubscribeDemo({ trashPileRef }) {
  const { width } = useWindowSize();
  const ref = useRef(null);
  const [state, dispatch] = useReducer(nodes, {
    count: 0,
    nodes: [items[0]]
  });

  const onClick = useCallback(
    () => {
      dispatch({ type: 'next' });
    },
    [dispatch]
  );

  const fallLimit = useMemo(
    () => {
      if (ref && trashPileRef) {
        console.log(width);
        const top = trashPileRef.offsetTop;
        const elTop = ref.current.getBoundingClientRect().y;
        return top - elTop - 50;
      }
    },
    [width, ref, trashPileRef]
  );

  return (
    <div className="example-container" ref={ref}>
      {state.nodes.map(item => {
        return (
          <Item
            fallLimit={fallLimit}
            key={item.name}
            {...item}
            onClick={onClick}
          />
        );
      })}
    </div>
  );
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Item({
  animate = true,
  name,
  email,
  text = '',
  onClick = () => {},
  fallLimit,
  subject
}) {
  const ref = useRef(null);
  const outerRef = useRef(null);
  const textRef = useRef(null);

  const onChange = useCallback(
    () => {
      onClick();
      if (!animate) {
        return false;
      }
      textRef.current.style.opacity = 0;
      const v = 100;
      const angle = rand(50, 90); // The angle of projection is a number between 80 and 89 degrees.
      const theta = (angle * Math.PI) / 180; // Theta is the angle in radians
      const g = -9.8; // And gravity is -9.8. If you live on another planet feel free to change

      // time is initially zero, also set some random variables. It's higher than the total time for the projectile motion
      // because we want the squares to go off screen.
      let t = 0;
      let nx;
      let ny;

      // The direction can either be left (1), right (-1) or center (0). This is the horizontal direction.
      const negate = [1, -1, 1, -1, 0];
      const direction = negate[Math.floor(Math.random() * negate.length)];

      // Some random numbers for altering the shapes position
      const randScale = Math.random().toFixed(2);
      let randDeg2 = rand(360, 60);
      if (direction !== 0) randDeg2 = randDeg2 * direction;
      // And apply those
      const baseTransform = `scale(${randScale}) rotateZ(${randDeg2}deg)`;
      console.log(`direction(${direction}) ${baseTransform}`);
      ref.current.style.transform = baseTransform;

      const frame = function() {
        // Horizontal speed is constant (no wind resistance on the internet)
        var ux = Math.cos(theta) * v * direction;
        // Vertical speed decreases as time increases before reaching 0 at its peak
        var uy = Math.sin(theta) * v - -g * t;
        // The horizontal position
        nx = ux * t;
        // s = ut + 0.5at^2
        ny = uy * t + 0.5 * g * Math.pow(t, 2);
        // Apply the positions
        outerRef.current.style.transform = `translate(${nx}px, ${-ny}px)`;
        // Increase the time by 0.10
        t = t + 0.15;

        if (ny > -fallLimit) {
          window.requestAnimationFrame(frame);
        }
      };
      window.requestAnimationFrame(frame);
    },
    [ref, outerRef, onClick, fallLimit, animate]
  );
  return (
    <Transition timeout={200} appear in={true}>
      {state => {
        return (
          <>
            <div
              data-state={state}
              ref={outerRef}
              className="example-unsubscribe-container"
              key={name}
            >
              <div ref={ref} className="example-unsubscribe" data-state={state}>
                <div className="example-from-column">
                  <div className="example-from-name-container">
                    <span className="exmaple-from-name">{name}</span>
                  </div>
                  <span className="example-from-email">{email}</span>
                </div>
                <div className="example-subject-column">{subject}</div>
                <div className="example-toggle">
                  <Toggle status={true} onChange={onChange} />
                </div>
              </div>
            </div>
            {text ? (
              <div className="example-unsub-text">
                <p ref={textRef}>{text}</p>
              </div>
            ) : null}
          </>
        );
      }}
    </Transition>
  );
}
