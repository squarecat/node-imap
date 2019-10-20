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
import terrance from '../assets/testimonials/terrance.png';
import useAsync from 'react-use/lib/useAsync';

const cdnUrl = `${process.env.CDN_URL}/images`;
const metaImgUrl = `${cdnUrl}/meta/leave-me-alone-vs-unroll-me.png`;

function UnrollMeAlternative() {
  const { error: statsError, value: statsData } = useAsync(fetchStats, []);

  const joinContent = useMemo(() => {
    if (statsError) {
      return null;
    }
    const userCount = statsData ? formatNumber(statsData.users) : 0;
    return (
      <p styleName="join-text">
        Join <TextImportant>{userCount} people</TextImportant> using{' '}
        <TextImportant>Leave Me Alone</TextImportant> instead of Unroll.Me.
      </p>
    );
  }, [statsData, statsError]);

  return (
    <SubpageLayout
      title={`A Better Unroll.Me Alternative (that values your privacy) - Leave Me Alone`}
      description={`Leave Me Alone is an Unroll.Me alternative that makes it easier to unsubscribe from emails without selling your data. See why people are switching from Unroll.Me. Try Leave Me Alone free today!`}
      slug="/unroll-me-alternative"
      imgUrl={metaImgUrl}
      withContent={false}
    >
      <div styleName="alternative-inner">
        <div styleName="container">
          <div styleName="container-text">
            <h1 styleName="title">
              The Unroll.Me alternative that doesn't sell your data. Ever.
            </h1>
            <p styleName="tagline">
              Leave Me Alone is an Unroll.Me alternative that's{' '}
              <TextImportant>privacy-focused</TextImportant>, easy to use, and
              available in the EU.
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
        <PublicationQuote
          centered
          bordered
          publication="lifehacker"
          text={
            <span>
              Unlike Unroll.me, Leave Me Alone is{' '}
              <TextHighlight>not also collecting your data</TextHighlight>.
            </span>
          }
        />
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
                <span styleName="col-title alternative">Unroll.Me</span>
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
              <td styleName="cell">Privacy policy</td>
              <td styleName="cell">Never stores or sells your data</td>
              <td styleName="cell">Aggregates and sells data for marketing</td>
            </tr>
            <tr>
              <td styleName="cell">Connect multiple emails</td>
              <td styleName="cell">Yes, unlimited</td>
              <td styleName="cell">No</td>
            </tr>
            <tr>
              <td styleName="cell">Instant unsubscribes</td>
              <td styleName="cell">Yes</td>
              <td styleName="cell">No, takes 24 hours</td>
            </tr>
            <tr>
              <td styleName="cell">Sender rating</td>
              <td styleName="cell">Yes</td>
              <td styleName="cell">No</td>
            </tr>
            <tr>
              <td styleName="cell">Available in the EU & EEA</td>
              <td styleName="cell">Yes</td>
              <td styleName="cell">
                No, stopped providing service to all EU residents on May 23
              </td>
            </tr>
            <tr>
              <td styleName="cell">Live chat support</td>
              <td styleName="cell">Yes</td>
              <td styleName="cell">No</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Alternative specific social proof/testimonial */}
      <div styleName="alternative-inner">
        <Testimonial
          text={
            <span>
              I've used Leave Me Alone. It's great! They{' '}
              <TextHighlight>
                don't use your email data like Unroll.Me
              </TextHighlight>
              .
            </span>
          }
          author="Terrance Kwok, Product Manager - Chili Piper"
          image={terrance}
          centered
          alternative
        />
      </div>

      <div styleName="alternative-inner">
        <div styleName="features">
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={lockImg} alt="lock face image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">Your data is yours</h3>
              <p>
                At Leave Me Alone, we charge for our service so that you can be
                sure we will never exploit your data in order to keep our lights
                on. We don't store the content of your emails. All of your
                emails are sent directly to you, and stored in your browser, not
                our servers.
              </p>
              <p>
                <TextLink as="link" linkTo="/security">
                  Security at Leave Me Alone{' '}
                  <ArrowIcon inline width="12" height="12" />
                </TextLink>
              </p>
            </div>
          </div>
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={broomImg} alt="broom sweeping image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">Unsubscribe instantly</h3>
              <p>
                Leave Me Alone unsubscribes you from unwanted emails instantly.
                When you click unsubscribe there are no rules, bundles, or
                rollup features hiding the junk from you. Those subscriptions
                are gone forever, even if you decide to stop using our service.
              </p>
              <p>
                <TextLink as="link" linkTo="/learn">
                  How Leave Me Alone works{' '}
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
              <h3 styleName="feature-title">Clean all accounts together</h3>
              <p>
                Connect all of your email accounts to Leave Me Alone, and clear
                out the unwanted mail in one go. We support all Google and
                Microsoft accounts, including Gmail, G Suite, Outlook, and
                Hotmail. Plus, Yahoo, iCloud, Fastmail, AOL & all IMAP accounts.
              </p>
              <p>
                <TextLink href="/supported-email-providers">
                  Leave Me Alone supported providers{' '}
                  <ArrowIcon inline width="12" height="12" />
                </TextLink>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div styleName="alternative-inner">
        <Testimonial
          author="Tamara Sredojevic, Freelance Marketing Strategist"
          text={
            <span>
              I love to <TextHighlight>know that my data is safe</TextHighlight>
              . Leave Me Alone is user friendly, it's beautiful and it does the
              job well. What more could I ask for?
            </span>
          }
          centered
          image={`${cdnUrl}/testimonials/image-18.jpg`}
        />
      </div>

      <div styleName="questions">
        <div styleName="alternative-inner">
          <h2>I have more questions...</h2>
          <div styleName="questions-grid">
            <div styleName="question">
              <h3>
                <span styleName="question-icon">
                  <SearchIcon width={20} height={20} />
                </span>{' '}
                How do you unsubscribe me instantly?
              </h3>
              <p>
                We follow the unsubscribe links provided in the newsletters and
                subscription emails to unsubscribe you. If there's no link, then
                we send an email to their unsubscribe mailing address. Providing
                they obey the rules, you will be unsubscribed.
              </p>
            </div>
            <div styleName="question">
              <h3>
                <span styleName="question-icon">
                  <SearchIcon width={20} height={20} />
                </span>{' '}
                What about migration, do you offer that?
              </h3>
              <p>
                You don't need to migrate from Unroll.Me, we will show you all
                of the subscription emails in your inbox and Rollup folders. You
                can start using Leave Me Alone straight away!
              </p>
            </div>

            <div styleName="question">
              <h3>
                <span styleName="question-icon">
                  <SearchIcon width={20} height={20} />
                </span>{' '}
                Do you really value my privacy?
              </h3>
              <p>
                Yes! Privacy is at the core of our business. We never store the
                content of your emails, we only ask for the mailbox{' '}
                <TextLink inverted href="/security">
                  permissions we need
                </TextLink>{' '}
                to operate, and we are completely open and transparent about our{' '}
                <TextLink inverted href="/open">
                  revenue
                </TextLink>{' '}
                and{' '}
                <TextLink inverted href="/privacy">
                  how we operate
                </TextLink>
                .
              </p>
            </div>
            <div styleName="question">
              <h3>
                <span styleName="question-icon">
                  <SearchIcon width={20} height={20} />
                </span>{' '}
                Can I try Leave Me Alone for free?
              </h3>
              <p>
                As soon as you log-in and connect an account you we show you all
                of the subscription emails in your inbox. Every new account
                receives 5 free credits to try out our super quick and easy
                unsubscribing!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div styleName="alternative-inner end-stuff">
        <h2>We're the Unroll.Me alternative you can trust.</h2>
        <p>
          Sign up to Leave Me Alone to unsubscribe from unwanted emails
          instantly without compromising your personal information.
        </p>
        <a
          href="/signup"
          event={'clicked-unroll-me-alternative-cta'}
          className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert`}
          style={{ margin: '50px auto 90px auto' }}
        >
          Start Unsubscribing
        </a>
        <PublicationQuote
          centered
          publication="makeuseof"
          text={
            <span>
              Leave Me Alone is a{' '}
              <TextHighlight>
                privacy-friendly way of doing the same thing that Unroll.me did
              </TextHighlight>{' '}
              while knowing your data is safe.
            </span>
          }
        />
      </div>
    </SubpageLayout>
  );
}

export default UnrollMeAlternative;

function fetchStats() {
  return request('/api/stats?summary=true');
}
function formatNumber(n) {
  return n > 999999 ? numeral(n).format('0a') : numeral(n).format('0,0');
}
