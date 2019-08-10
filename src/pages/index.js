import 'isomorphic-fetch';
import './home.scss';

import {
  Arrow as ArrowIcon,
  AtSignIcon,
  GoogleIcon,
  MicrosoftIcon,
  PointyArrow
} from '../components/icons';
import React, {
  useCallback,
  useMemo,
  useReducer,
  useRef,
  useState
} from 'react';
import { TextHighlight, TextImportant, TextLink } from '../components/text';

import Footer from '../components/footer';
import Header from '../components/landing/header';
import Layout from '../layouts/layout';
import MailListIllustration from '../components/landing/illustration';
import { Pricing } from './pricing';
import Testimonial from '../components/landing/testimonial';
import Toggle from '../components/toggle';
import { Transition } from 'react-transition-group';
import _capitalize from 'lodash.capitalize';
import aolImg from '../assets/providers/imap/aol-logo.png';
import connectAccounts from '../assets/accounts.png';
import envelope from '../assets/open-envelope-love.png';
import fastmailImg from '../assets/providers/imap/fastmail-logo-white.png';
import icloudImg from '../assets/providers/imap/icloud-logo-white.png';
import luke from '../assets/luke.jpeg';
import numeral from 'numeral';
import { openTweetIntent } from '../utils/tweet';
import request from '../utils/request';
import subscriberScore from '../assets/subscriber-score.png';
import useAsync from 'react-use/lib/useAsync';
import useWindowSize from 'react-use/lib/useWindowSize';
import yahooImg from '../assets/providers/imap/yahoo-logo-white.png';

const faker = require('../vendor/faker/locale/en');

const NEWS = [
  {
    name: 'Fast Company',
    quote: (
      <span>
        Leave Me Alone{' '}
        <TextHighlight>doesn’t sell your email data</TextHighlight> to marketers
        as some other unsubscribe services do.
      </span>
    ),
    url:
      'https://www.fastcompany.com/90326825/the-25-best-new-productivity-apps-for-2019',
    logoUrl: 'https://cdn.leavemealone.app/images/news/fast-company-logo.png'
  },
  {
    name: '.xyz',
    quote: (
      <span>
        Wish you could take back control of your inbox and declutter it{' '}
        <TextHighlight>without having to sacrifice your privacy</TextHighlight>?
      </span>
    ),
    url: 'https://gen.xyz/blog/leavemealonexyz',
    logoUrl: 'https://cdn.leavemealone.app/images/news/xyz.png'
  },
  {
    name: 'The Register',
    quote: (
      <span>
        Leave Me Alone make{' '}
        <TextHighlight>
          significantly stronger privacy commitments
        </TextHighlight>{' '}
        than companies in the data collection business.
      </span>
    ),
    url: 'https://www.theregister.co.uk/2019/02/11/google_gmail_developer/',
    logoUrl: 'https://cdn.leavemealone.app/images/news/the-register-logo.png'
  }
];

export const OAUTH_PROVIDERS = `Gmail, G Suite, Googlemail, Outlook, Office 365, Live, Hotmail, and MSN`;
export const IMAP_PROVIDERS = `Fastmail, Yahoo Mail, iCloud, AOL, and all other mailboxes`;

const IndexPage = () => {
  const trashPileRef = useRef(null);
  const {
    error: statsError,
    loading: statsLoading,
    value: statsData
  } = useAsync(fetchStats, []);
  const [isTruckShown, showTruck] = useState(false);

  const statsContent = useMemo(
    () => {
      if (statsError) {
        return null;
      }
      const userCount = statsData ? formatNumber(statsData.users) : 0;
      const unsubCount = statsData
        ? formatNumber(statsData.unsubscriptions)
        : 0;
      return (
        <p className={`join-text ${statsLoading ? 'join-text-loading' : ''}`}>
          Join <span className="join-stat">{userCount} users</span> who have
          unsubscribed from a total of{' '}
          <span className="join-stat">{unsubCount} spam</span> emails
        </p>
      );
    },
    [statsData, statsError, statsLoading]
  );

  const bannerShown = false;

  return (
    <Layout>
      <div id="main">
        <Header setActive={() => {}} />
        <div
          className={`home-container friendly-neighbourhood-hero ${
            bannerShown ? 'friendly-neighbourhood-hero-bannered' : ''
          }`}
        >
          <div className="hero-inner">
            <div className="hero-box hero-left">
              <div className="hero-left-inner">
                <h1 className="catchy-tagline">
                  Easily unsubscribe from spam emails
                </h1>
                <p className="informative-description">
                  See all of your subscription emails in one place and
                  unsubscribe from them with a single click.
                </p>

                <div className="join-container">
                  <a
                    href="/signup?ref=hero"
                    className={`beam-me-up-cta`}
                    // state={{ register: true }}
                  >
                    Get Started For Free!
                  </a>
                  {statsContent}
                </div>
              </div>
            </div>
            <div className="hero-box hero-right">
              <UnsubscribeDemo
                onFirstClick={() => showTruck(true)}
                trashPileRef={trashPileRef.current}
              />
            </div>
          </div>
        </div>

        <div className="home-container">
          <div className="home-container-inner" id="learn">
            <div className="image-section">
              <div className="image-section-text">
                <h3>All of your subscription emails together</h3>
                <p>
                  Too much noise in your inbox? We show you all the mailing
                  lists you're subscribed to and let you unsubscribe with one
                  click.
                </p>
              </div>
              <div className="image-section-img">
                <MailListIllustration />
              </div>
            </div>

            <div className="image-section image-left">
              <div className="image-section-img">
                <img src={subscriberScore} alt="subscriber score image" />
              </div>
              <div className="image-section-text">
                <h3>Quickly see the worst spammers</h3>
                <p>
                  We rank each of your subscriptions based on our unique
                  Subscriber Score, so you can quickly tell if it's worth
                  hanging on to.
                </p>
                <p>
                  <TextLink as="link" linkTo="/learn">
                    <span>View all features of Leave Me Alone</span>{' '}
                    <ArrowIcon inline />
                  </TextLink>
                </p>
              </div>
            </div>

            <div className="image-section">
              <div className="image-section-text">
                <h3>Clean all of your inboxes at once</h3>
                <p>
                  Connect all of your email accounts and scan them together.
                  Clear out all of your subscription emails from all of your
                  email addresses in one go.
                </p>
                <p />
              </div>
              <div className="image-section-img bordered">
                <img src={connectAccounts} alt="connected accounts image" />
              </div>
            </div>

            <div className="image-section image-left privacy">
              <div className="image-section-img">
                <img src={envelope} alt="private envelope image" />
              </div>
              <div className="image-section-text">
                <h3>Privacy first</h3>
                <p>
                  We're committed to privacy. We don't store any email content
                  so you don't have to worry about us losing or selling your
                  data.
                </p>
                <p>
                  <TextLink as="link" linkTo="/security">
                    <span>Learn more about security and privacy</span>{' '}
                    <ArrowIcon inline />
                  </TextLink>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="trash-pile"
          id="trash-pile"
          data-show-truck={isTruckShown}
        >
          <div className="home-container">
            <div className="text-box text-box-centered">
              <h3>Say goodbye to subscriptions forever</h3>
              <p>
                When you hit the unsubscribe button we don't just move your mail
                into a folder or to trash, instead we actually unsubscribe you
                from the list.
              </p>
              <p>
                This means the subscriptions are{' '}
                <TextImportant>gone forever</TextImportant>, even if you decide
                to stop using our service.
              </p>
              <a
                href="/learn"
                className={`beam-me-up-cta beam-me-up-cta-center`}
              >
                Learn More
              </a>
            </div>
          </div>
        </div>

        <div className="learn-providers" ref={trashPileRef} id="providers">
          <div className="home-container">
            <div className="text-box text-box-centered">
              <h3 className="providers-header">
                We support both Gmail and Outlook
              </h3>
              <p>
                If you have a Google or Microsoft email account then we have you
                covered. This includes {OAUTH_PROVIDERS}.
              </p>
              <div className="provider-logos">
                <TextLink undecorated as="link" linkTo="/providers/google">
                  <span className="provider-logo">
                    <GoogleIcon width="60" height="60" />
                  </span>
                </TextLink>
                <TextLink undecorated as="link" linkTo="/providers/microsoft">
                  <span className="provider-logo">
                    <MicrosoftIcon width="60" height="60" />
                  </span>
                </TextLink>
              </div>
              <div className="text-box text-box-centered">
                <p>We also support {IMAP_PROVIDERS} that work with IMAP.</p>
                <TextLink undecorated as="link" linkTo="/providers/imap">
                  <div className="provider-logos">
                    <span className="provider-logo imap" title="Fastmail">
                      <img src={fastmailImg} alt="Fastmail logo" />
                    </span>
                    <span className="provider-logo imap invert" title="AOL">
                      <img src={aolImg} alt="AOL logo" />
                    </span>
                    <span className="provider-logo imap" title="iCloud">
                      <img src={icloudImg} alt="iCloud logo" />
                    </span>
                    <span
                      className="provider-logo imap brighter"
                      title="Yahoo Mail"
                    >
                      <img src={yahooImg} alt="Yahoo Mail logo" />
                    </span>
                  </div>
                </TextLink>
              </div>

              <a
                href="/signup?ref=providers"
                className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert`}
              >
                Start Unsubscribing
              </a>
            </div>
          </div>
        </div>

        <div className="home-container section-padded">
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

        <div className="home-container section-padded">
          <div className="home-container-inner" id="news">
            <h3>In the news</h3>
            <p>
              Don't take our word for it, read what people are saying about us.
            </p>
            <div className="in-the-news">
              {NEWS.map(({ quote, logoUrl, url }) => (
                <div key={url} className="news-item">
                  <p>"{quote}"</p>
                  <a target="_" className="news-logo" href={url}>
                    <img src={logoUrl} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="home-container">
          <div className="text-box text-box-left">
            <Testimonial
              text={`Using Leave Me Alone has resulted in a 17% reduction in my
                emails, saving me hours of time each month.`}
              author="Luke Chadwick, Founder - GraphQL360"
              image={luke}
            />
            <TextLink as="link" linkTo="/wall-of-love">
              <span>See all of our customer testimonials</span>{' '}
              <ArrowIcon inline />
            </TextLink>
          </div>
        </div>

        <div className="home-container">
          <div className="home-container-inner end-stuff">
            {statsContent}
            <a
              href="/signup?ref=footer"
              className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert`}
              style={{ margin: '50px auto' }}
            >
              Get Started For Free
            </a>
          </div>
        </div>

        <Footer />
      </div>
    </Layout>
  );
};

function fetchStats() {
  return request('/api/stats?summary=true');
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

IndexPage.whyDidYouRender = true;

export default IndexPage;

function formatNumber(n) {
  return n > 999999 ? numeral(n).format('0a') : numeral(n).format('0,0');
}

const items = [
  {
    name: 'Black Friday Cacti',
    email: '<marketing@cact.us>',
    subject: `🌵 One day only, 80% off your next cactus!`,
    text: (
      <span>
        It's as simple as a single click. Go on, click me!{' '}
        <PointyArrow width="15" height="15" />
      </span>
    )
  },
  {
    name: 'Mars Travel 🌝',
    email: '<marketing@travel.com>',
    subject: 'New price alert for your flight outta here - Book!',
    text: 'Woohoo, that subscription is gone forever! How about this one?'
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
  if (count < 50) {
    return `Hey go easy, we might run out!`;
  }
  if (count < 100) {
    return `Okay you're pretty serious about this. But I bet you can't get to 100!`;
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

  return (
    <span>
      ...Psst, you're awesome. Use the coupon{' '}
      <TextImportant>I_REALLY_HATE_SUBSCRIPTIONS</TextImportant> for a huge 10%
      off 😍. Our little secret OK?
    </span>
  );
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
          subject: _capitalize(faker.company.bs()),
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

function UnsubscribeDemo({ trashPileRef, onFirstClick }) {
  const { width } = useWindowSize();
  const ref = useRef(null);
  const [state, dispatch] = useReducer(nodes, {
    count: 0,
    nodes: [items[0]]
  });

  const onClick = useCallback(
    () => {
      if (state.count === 0) {
        onFirstClick();
      }
      dispatch({ type: 'next' });
    },
    [dispatch]
  );

  const fallLimit = useMemo(
    () => {
      if (ref.current && trashPileRef) {
        console.log(width);
        const top = trashPileRef.offsetTop;
        const elTop = ref.current.getBoundingClientRect().y;
        return top - elTop - 50;
      }
    },
    [trashPileRef, width]
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
            count={state.count}
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
  subject,
  count = 0
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
      // console.log(`direction(${direction}) ${baseTransform}`);
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
        } else {
          // remove will-change
          ref.current.style.willChange = 'auto';
          outerRef.current.style.willChange = 'auto';
        }
      };
      // add will-change
      ref.current.style.willChange = 'transform, opacity';
      outerRef.current.style.willChange = 'transform';
      window.requestAnimationFrame(frame);
    },
    [ref, outerRef, onClick, fallLimit, animate]
  );

  const onClickTweet = useCallback(
    () => {
      const text = `I'm loving the one-click unsubscribe button on @LeaveMeAloneApp... I've clicked it ${count} times! 🙅‍ ${
        window.location.host
      }`;
      openTweetIntent(text);
    },
    [count]
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
                    <span className="example-from-name">{name}</span>
                  </div>
                  <span className="example-from-email">{email}</span>
                </div>
                <div className="example-subject-column">{subject}</div>
                <div className="example-toggle">
                  <Toggle status={true} onChange={onChange} />
                </div>
              </div>
            </div>

            <div className="example-unsub-text" ref={textRef}>
              <p>{text}</p>
              <Transition timeout={200} appear in={count > 2}>
                {state => {
                  return (
                    <>
                      <p data-state={state}>That's {count} gone!</p>
                      <a
                        className="example-unsub-tweet-btn"
                        data-state={state}
                        onClick={onClickTweet}
                      >
                        Tweet progress
                      </a>
                    </>
                  );
                }}
              </Transition>
            </div>
          </>
        );
      }}
    </Transition>
  );
}
