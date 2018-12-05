import React, { useRef, useEffect, useState } from 'react';
import numeral from 'numeral';
import AnimatedNumber from 'react-animated-number';
import TrackVisibility from 'react-on-screen';

import { useAsync } from '../utils/hooks';
import envelope from '../assets/envelope.png';
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
      top: document.querySelector('.privacy').offsetTop,
      left: 0,
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    document.querySelectorAll('twitter-widget').forEach(e => {
      const style = document.createElement('style');
      style.innerHTML = `
    .Tweet-card {
      display: none;
    }`;
      e.shadowRoot.appendChild(style);
    });
  }, []);
  return (
    <Layout>
      <Colin />
      <div id="main">
        <div className="friendly-neighbourhood-hero">
          <div>
            <div className="leave-me-alone-logo" ref={activeRef}>
              <span>
                <img src={envelope} alt="gmail-logo" className="gmail-logo" />
              </span>
              <span className="logo-emoji">
                <img src={girlLogo} alt="girl-logo" className="girl-logo" />
              </span>
            </div>
            <h1 className="title">Leave Me Alone!</h1>

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

            <TrackVisibility>
              {({ isVisible }) => <Stats isVisible={isVisible} />}
            </TrackVisibility>

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
        <div className="love">
          <div>
            <h2>💌 Wall of love 💌</h2>
            <p>
              Our users are awesome and they think we're awesome too. Take a
              look at all the nice things they've said about us!
            </p>
            <div className="tweet-wall">
              <div className="tweet-box">
                <div className="col">
                  <blockquote
                    className="twitter-tweet"
                    data-conversation="none"
                    data-cards="hidden"
                    data-lang="en"
                  >
                    <p lang="en" dir="ltr">
                      I must admit I&#39;m lazy at unsubscribing to subscription
                      emails, so my email inbox grows at an alarming rate every
                      day. I just used{' '}
                      <a href="https://twitter.com/LeaveMeAloneApp?ref_src=twsrc%5Etfw">
                        @LeaveMeAloneApp
                      </a>{' '}
                      and unsubscribed to 15 emails in 3 minutes. What a great
                      idea! 🙅‍♀️
                    </p>
                    &mdash; Tom Haworth (@tomhaworth_b13){' '}
                    <a href="https://twitter.com/tomhaworth_b13/status/1068904289031065602?ref_src=twsrc%5Etfw">
                      December 1, 2018
                    </a>
                  </blockquote>

                  <blockquote
                    className="twitter-tweet"
                    data-conversation="none"
                    data-cards="hidden"
                    data-lang="en"
                  >
                    <p lang="en" dir="ltr">
                      🙌 I&#39;ve been beta testing{' '}
                      <a href="https://twitter.com/LeaveMeAloneApp?ref_src=twsrc%5Etfw">
                        @LeaveMeAloneApp
                      </a>{' '}
                      and it&#39;s the best because I can never find all
                      newsletters I&#39;m subscribed too. I unsubscribed from a
                      few in seconds. So cool!! <br />
                      <br />
                      Check it out at{' '}
                      <a href="https://t.co/xIALdiT5YB">
                        https://t.co/xIALdiT5YB
                      </a>
                    </p>
                    &mdash; Sam Parton (@ItsMrSammeh){' '}
                    <a href="https://twitter.com/ItsMrSammeh/status/1068594425130037248?ref_src=twsrc%5Etfw">
                      November 30, 2018
                    </a>
                  </blockquote>
                  <blockquote
                    className="twitter-tweet"
                    data-conversation="none"
                    data-lang="en"
                  >
                    <p lang="en" dir="ltr">
                      Just tried it on mobile, cannot get over how quick, simple
                      and easy it is to unsubscribe.
                    </p>
                    &mdash; Pradip Khakhar (@pradipcloud){' '}
                    <a href="https://twitter.com/pradipcloud/status/1068964781401546752?ref_src=twsrc%5Etfw">
                      December 1, 2018
                    </a>
                  </blockquote>
                </div>
                <div className="col">
                  <blockquote className="twitter-tweet" data-lang="en">
                    <p lang="en" dir="ltr">
                      Such a good privacy-first app built my indie makers! Can’t
                      wait for the full launch 💌{' '}
                      <a href="https://t.co/DxRKc2WfX3">
                        https://t.co/DxRKc2WfX3
                      </a>
                    </p>
                    &mdash; Steph Smith (@stephsmithio){' '}
                    <a href="https://twitter.com/stephsmithio/status/1068872694710628352?ref_src=twsrc%5Etfw">
                      December 1, 2018
                    </a>
                  </blockquote>
                  <blockquote
                    className="twitter-tweet"
                    data-cards="hidden"
                    data-conversation="none"
                    data-lang="en"
                  >
                    <p lang="en" dir="ltr">
                      Loving it so far. I just got 4 emails from different sites
                      saying goodbye cos I got unsubbed from them 😂 I just
                      played &#39;Thank you, next&#39; by Ariana Grande loud and
                      clear and had some coffee grinning like a maniac ☕
                    </p>
                    &mdash; Dinuka (@its_dinuka){' '}
                    <a href="https://twitter.com/its_dinuka/status/1068558838670909440?ref_src=twsrc%5Etfw">
                      November 30, 2018
                    </a>
                  </blockquote>
                  <blockquote
                    className="twitter-tweet"
                    data-conversation="none"
                    data-cards="hidden"
                    data-lang="en"
                  >
                    <p lang="en" dir="ltr">
                      <a href="https://twitter.com/LeaveMeAloneApp?ref_src=twsrc%5Etfw">
                        @leavemealoneapp
                      </a>{' '}
                      is my new hero....
                      <br />
                      <br />
                      I&#39;m sure we can all use such a great idea...{' '}
                      <a href="https://t.co/Nx1FhA7SAk">
                        pic.twitter.com/Nx1FhA7SAk
                      </a>
                    </p>
                    &mdash; TheAddledSpine (@TheAddledSpine){' '}
                    <a href="https://twitter.com/TheAddledSpine/status/1069151473928425473?ref_src=twsrc%5Etfw">
                      December 2, 2018
                    </a>
                  </blockquote>
                </div>
                <div className="col">
                  <blockquote
                    className="twitter-tweet"
                    data-conversation="none"
                    data-cards="hidden"
                    data-lang="en"
                  >
                    <p lang="en" dir="ltr">
                      I&#39;m honestly impressed by{' '}
                      <a href="https://twitter.com/LeaveMeAloneApp?ref_src=twsrc%5Etfw">
                        @LeaveMeAloneApp
                      </a>{' '}
                      ! I unsubcribed from ~ 97 subscriptions in A LOT less
                      time, than I would have needed if I did it manually.{' '}
                      <br /> ▶️ Fast
                      <br />
                      ▶️ Easy
                      <br />
                      ▶️ Beautiful ❤️😀{' '}
                      <a href="https://t.co/vMZuM8xAMM">
                        https://t.co/vMZuM8xAMM
                      </a>
                    </p>
                    &mdash; Luis Hocke (@luishocke){' '}
                    <a href="https://twitter.com/luishocke/status/1068872261384499200?ref_src=twsrc%5Etfw">
                      December 1, 2018
                    </a>
                  </blockquote>
                  <blockquote className="twitter-tweet" data-lang="en">
                    <p lang="en" dir="ltr">
                      <a href="https://twitter.com/LeaveMeAloneApp?ref_src=twsrc%5Etfw">
                        @LeaveMeAloneApp
                      </a>{' '}
                      is shaping up to be an amazing product... <br />
                      <br />
                      Keep it up guys!
                    </p>
                    &mdash; Sergio Mattei ✌️ (@matteing){' '}
                    <a href="https://twitter.com/matteing/status/1068871586617413632?ref_src=twsrc%5Etfw">
                      December 1, 2018
                    </a>
                  </blockquote>
                  <blockquote
                    className="twitter-tweet"
                    data-conversation="none"
                    data-lang="en"
                  >
                    <p lang="en" dir="ltr">
                      If there&#39;s one thing I love, it&#39;s a clean inbox!
                      Thanks for having me! ✌️
                    </p>
                    &mdash; Chris Malby-Tynan (@ChrisMalbyTynan){' '}
                    <a href="https://twitter.com/ChrisMalbyTynan/status/1069236707667652610?ref_src=twsrc%5Etfw">
                      December 2, 2018
                    </a>
                  </blockquote>
                </div>
              </div>
            </div>
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
            <a className="link" href="/privacy">
              Privacy
            </a>
          </li>
          <li>
            <a className="link" href="/terms">
              Terms
            </a>
          </li>
          <li>
            <a
              className="link"
              target="_blank"
              rel="noopener noreferrer"
              href="http://leavemealone.releasepage.co"
            >
              Releases
            </a>
          </li>
          <li>
            <a
              className="link"
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.notion.so/33d2efb925634020a1cd64d40b91efe4"
            >
              Roadmap
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

function fetchStats() {
  return fetch('/api/stats').then(r => r.json());
}

function Stats({ isVisible }) {
  const { loading, value } = useAsync(fetchStats);
  const [stats, setStats] = useState({
    unsubscribableEmails: 0,
    unsubscriptions: 0
  });

  useEffect(
    () => {
      if (!loading && isVisible) {
        const {
          unsubscribableEmails,
          unsubscriptions,
          previouslyUnsubscribedEmails
        } = value;
        setStats({
          unsubscribableEmails:
            unsubscribableEmails - previouslyUnsubscribedEmails,
          unsubscriptions,
          set: true
        });
      }
    },
    [loading, isVisible]
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
            formatValue={n =>
              n > 9999 ? numeral(n).format('0a') : n.toFixed()
            }
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
            formatValue={n =>
              n > 9999 ? numeral(n).format('0a') : n.toFixed()
            }
          />
        </span>
        <span>Spam emails unsubscribed</span>
      </div>
    </div>
  );
}

export default IndexPage;
