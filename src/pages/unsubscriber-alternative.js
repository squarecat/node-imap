import './alternatives.module.scss';

import React, { useMemo } from 'react';
import Testimonial, {
  PublicationQuote
} from '../components/landing/testimonial';
import { TextHighlight, TextImportant, TextLink } from '../components/text';

import { Arrow as ArrowIcon, SearchIcon } from '../components/icons';
import MailListIllustration from '../components/landing/illustration';
import SubpageLayout from '../layouts/subpage-layout';
import broomImg from '../assets/enterprise/broom.png';
import envelopeImg from '../assets/open-envelope-love.png';
import lockImg from '../assets/security/lock.png';
import logo from '../assets/logo.png';
import numeral from 'numeral';
import request from '../utils/request';
import luke from '../assets/testimonials/luke.jpeg';
import useAsync from 'react-use/lib/useAsync';

const cdnUrl = `${process.env.CDN_URL}/images`;
const metaImgUrl = `${cdnUrl}/meta/leave-me-alone-vs-unsubscriber.png`;

function UnsubscriberAlternative() {
  const { error: statsError, value: statsData } = useAsync(fetchStats, []);

  const joinContent = useMemo(() => {
    if (statsError) {
      return null;
    }
    const userCount = statsData ? formatNumber(statsData.users) : 0;
    return (
      <p styleName="join-text">
        Join <TextImportant>{userCount} people</TextImportant> using{' '}
        <TextImportant>Leave Me Alone</TextImportant> instead of Unsubscriber.
      </p>
    );
  }, [statsData, statsError]);

  return (
    <SubpageLayout
      title={`A Better Unsubscriber Alternative (that values your privacy) - Leave Me Alone`}
      description={`Leave Me Alone is an Unsubscriber alternative that works with all of your email accounts (including Gmail). See why people are switching from Unsubscriber. Try Leave Me Alone free today!`}
      slug="/unsubscriber-alternative"
      imgUrl={metaImgUrl}
      withContent={false}
    >
      <div styleName="alternative-inner">
        <div styleName="container">
          <div styleName="container-text">
            <h1 styleName="title">
              A simple, affordable Unsubscriber alternative for every inbox
            </h1>
            {/* A simple, affordable Unsubscriber alternative that works with Gmail */}
            <p styleName="tagline">
              Leave Me Alone is an Unsubscriber alternative that{' '}
              <TextImportant>works with Gmail</TextImportant>, has one-click
              unsubscribes, and support from the team who built the service.
            </p>
            <a href="/signup" className={`beam-me-up-cta`}>
            Start Unsubscribing
            </a>
            {joinContent}
          </div>
          <div styleName="container-image">
            <MailListIllustration />
          </div>
        </div>
      </div>

      <div styleName="publication-section">
        <PublicationQuote centered bordered publication="fastcompany" />
      </div>

      <div styleName="alternative-inner collapsible">
        <table styleName="table">
          <thead>
            <tr>
              <th styleName="head-cell"></th>
              <th styleName="head-cell">
                <div styleName="table-logo">
                  <img src={logo} alt="Leave Me Alone logo" />
                  <span styleName="col-title lma">Leave Me Alone</span>
                </div>
              </th>
              <th styleName="head-cell">
                <span styleName="col-title alternative">Unsubscriber</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td styleName="cell">Pricing</td>
              <td styleName="cell">Starts at $2.50 for 50 credits</td>
              <td styleName="cell">Free</td>
            </tr>
            <tr>
              <td styleName="cell">Works with Gmail</td>
              <td styleName="cell">Yes</td>
              <td styleName="cell">No</td>
            </tr>
            <tr>
              <td styleName="cell">Connect multiple accounts</td>
              <td styleName="cell">Yes, unlimited</td>
              <td styleName="cell">No</td>
            </tr>
            <tr>
              <td styleName="cell">Privacy policy</td>
              <td styleName="cell">
                You own your data and email content is never stored
              </td>
              <td styleName="cell">
                Requires consent to collect and sell your data to their
                customers
              </td>
            </tr>
            <tr>
              <td styleName="cell">Support team</td>
              <td styleName="cell">Yes - from the founders</td>
              <td styleName="cell">No, discontinued indefinitely</td>
            </tr>
            <tr>
              <td styleName="cell">Instant unsubscribes</td>
              <td styleName="cell">Yes</td>
              <td styleName="cell">Yes</td>
            </tr>
            <tr>
              <td styleName="cell">Sender rating</td>
              <td styleName="cell">Yes</td>
              <td styleName="cell">No</td>
            </tr>
            <tr>
              <td styleName="cell">Unsubscribe feedback</td>
              <td styleName="cell">
                Yes, failed unsubscribe alerts (+ failures don't cost credits)
              </td>
              <td styleName="cell">No</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div styleName="alternative-inner">
        <Testimonial
          author="Luke Chadwick, Founder - GraphQL360"
          text={
            <span>
              Using Leave Me Alone has resulted in a{' '}
              <TextHighlight>17% reduction in my emails</TextHighlight>, saving
              me hours of time each month.
            </span>
          }
          centered
          image={luke}
        />
      </div>

      <div styleName="alternative-inner">
        <div styleName="features">
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={broomImg} alt="broom sweeping image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">Unsubscribe everywhere</h3>
              <p>
                Connect all of your email addresses, including different mail
                providers, to one Leave Me Alone account. Unsubscribe from
                emails in Gmail, G Suite, Outlook, and Hotmail. Plus, Yahoo,
                iCloud, Fastmail, AOL and your IMAP accounts all together.
              </p>
              <p>
                <TextLink href="/supported-email-providers">
                  Supported email providers{' '}
                  <ArrowIcon inline width="12" height="12" />
                </TextLink>
              </p>
            </div>
          </div>
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={lockImg} alt="lock face image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">Your data is safe</h3>
              <p>
                At Leave Me Alone we take privacy and data-security very
                seriously. We never store the content of your emails on our
                servers, we only request the permissions we need to help you
                unsubscribe, and you can deactivate your account at any time.
              </p>
              <p>
                <TextLink as="link" linkTo="/security">
                  Our security commitment{' '}
                  <ArrowIcon inline width="12" height="12" />
                </TextLink>
              </p>
            </div>
          </div>
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={envelopeImg} alt="private envelope image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">Love your inbox again</h3>
              <p>
                When you unsubscribe using Leave Me Alone we instantly
                unsubscribe you. We use the mailing list's own instructions, so
                if they obey the rules, you will no longer receive emails from
                them. Those emails are gone forever, even if you don't use our
                service again.
              </p>
              <p>
                <TextLink as="link" linkTo="/learn">
                  How Leave Me Alone works{' '}
                  <ArrowIcon inline width="12" height="12" />
                </TextLink>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div styleName="alternative-inner">
        <Testimonial
          text={
            <span>
              The overall experience is very welcoming and smooth.{' '}
              <TextHighlight>
                I especially love the quality score of each email address
              </TextHighlight>
              .
            </span>
          }
          author="Amie Chen, Founder - Hyperyolo"
          image={`${cdnUrl}/testimonials/image-23.jpeg`}
          centered
        />
      </div>

      <div styleName="questions">
        <div styleName="alternative-inner">
          <h2>But, what about...</h2>
          <div styleName="questions-grid">
            <div styleName="question">
              <h3>
                <span styleName="question-icon">
                  <SearchIcon width={20} height={20} />
                </span>{' '}
                Do you have support if I need help?
              </h3>
              <p>
                Yes! Support requests are handled by us (the founders and
                developers) - so you are in good hands. We have live chat which
                you can access any time within the app, and if we are awake we
                will reply in minutes. If not, you can always reach out to us on
                Twitter or by email.
              </p>
            </div>

            <div styleName="question">
              <h3>
                <span styleName="question-icon">
                  <SearchIcon width={20} height={20} />
                </span>{' '}
                Is my data really mine?
              </h3>
              <p>
                Absolutely! The content of your emails is never stored on our
                servers - when we scan your mailbox your emails are sent
                directly to you and stored in your browser where only you have
                access to them. Plus, deactivate your account at any time to
                delete all of your data.
              </p>
            </div>
            <div styleName="question">
              <h3>
                <span styleName="question-icon">
                  <SearchIcon width={20} height={20} />
                </span>{' '}
                How long does it take to setup?
              </h3>
              <p>
                It's super fast to get started with Leave Me Alone! Simply
                log-in, connect your email accounts, and we will show you all of
                your subscription emails. You can start unsubscribing from
                unwanted emails straight away!
              </p>
            </div>
            <div styleName="question">
              <h3>
                <span styleName="question-icon">
                  <SearchIcon width={20} height={20} />
                </span>{' '}
                How do know which emails are subscriptions?
              </h3>
              <p>
                When we scan your inbox we can identify subscription emails by
                searching for a flag that senders include to mark it as
                unsubscribable. This contains information on how to unsubscribe
                from that email - which we can use!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div styleName="alternative-inner end-stuff">
        <h2>
          Finally, an Unsubscriber alternative that works withs with Gmail.
        </h2>
        <p>
          Sign up to Leave Me Alone and start unsubscribing from unwanted emails
          with the knowledge that your data is safe, and the founders are here
          to help.
        </p>
        <a
          href="/signup"
          event={'clicked-unsubscriber-alternative-cta'}
          className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert`}
          style={{ margin: '50px auto' }}
        >
          Clean My Inbox
        </a>
        <PublicationQuote
          centered
          publication="lifehacker"
          text={
            <span>
              Leave Me Alone{' '}
              <TextHighlight>sells none of its user data</TextHighlight>, even
              anonymized. You’re the customer, not the service.
            </span>
          }
        />
      </div>
    </SubpageLayout>
  );
}

export default UnsubscriberAlternative;

function fetchStats() {
  return request('/api/stats?summary=true');
}
function formatNumber(n) {
  return n > 999999 ? numeral(n).format('0a') : numeral(n).format('0,0');
}
