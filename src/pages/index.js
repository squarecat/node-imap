import 'isomorphic-fetch';
import './home.scss';

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
import { Pricing } from './pricing';
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

const news = [
  {
    name: 'Fast Company',
    quote:
      'No more junk. Although it’s not the first service that promises to unsubscribe you from junk emails, Leave Me Alone doesn’t sell your email data to marketers as some other unsubscribe services do.',
    shortQuote:
      'Leave Me Alone doesn’t sell your email data to marketers as some other unsubscribe services do.',
    url:
      'https://www.fastcompany.com/90326825/the-25-best-new-productivity-apps-for-2019',
    logoUrl: 'https://cdn.leavemealone.xyz/images/news/fast-company-logo.png'
  },
  {
    name: '.xyz',
    quote:
      'Wish you could take back control of your inbox and declutter it without having to sacrifice your privacy?',
    url: 'https://gen.xyz/blog/leavemealonexyz',
    logoUrl: 'https://cdn.leavemealone.xyz/images/news/xyz.png'
  },
  {
    name: 'The Register',
    quote:
      'Leave Me Alone make significantly stronger privacy commitments than companies in the data collection business.',
    url: 'https://www.theregister.co.uk/2019/02/11/google_gmail_developer/',
    logoUrl: 'https://cdn.leavemealone.xyz/images/news/the-register-logo.png'
  }
];

const IndexPage = ({ transitionStatus }) => {
  const trashPileRef = useRef(null);
  const { error: statsError, loading: statsLoading, value } = useAsync(
    fetchStats
  );
  let statsData = { users: 0, unsubscriptions: 0 };
  if (!statsLoading) {
    statsData = value;
  }

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
            <div className="hero-box hero-right">
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
              <div className="image-box right">
                <img
                  src={allSubscriptions}
                  className="all-unsubscriptions-img"
                  alt="all unsubscriptions"
                />
              </div>
            </div>
          </div>

          <div className="learn-2 boxed home-container-inner">
            <div className="home-box item-box">
              <div className="image-box left">
                <img
                  className="subscriber-score-img"
                  src={subscriberScore}
                  alt="subscriber score image"
                />
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
              <TextImportant>forever</TextImportant>, even if you decide to stop
              using our service.
            </p>
            <p style={{ margin: '1.45rem auto' }}>
              Read more about how it works <a href="/learn">here</a>.
            </p>
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

        <div className="pricing home-container">
          <div className="home-container-inner" id="pricing">
            <h3>Let's talk money</h3>
            <p>
              So that we can <a href="/pricing#why">keep your data safe</a>{' '}
              Leave Me Alone is a paid service. Each email you unsubscribe from
              costs one credit.
            </p>
          </div>
          <Pricing />
        </div>

        <div className="news home-container">
          <div className="home-container-inner" id="news">
            <h3>In the news</h3>
            <p>
              Don't take our word for it, see what these nice people have been
              saying about us.
            </p>
            <div className="in-the-news">
              {news.map(({ quote, shortQuote, logoUrl, url }) => (
                <div key={url} className="news-item">
                  <p>"{shortQuote || quote}"</p>
                  <a target="_" className="news-logo" href={url}>
                    <img src={logoUrl} />
                  </a>
                </div>
              ))}
            </div>
            <WallOfLove colLimit={1} />
          </div>

          <a
            href="/login"
            className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert`}
          >
            Get started for free
          </a>
        </div>

        <Footer />
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
    subject: 'New price alert for your flight outta here - Book!',
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
