import './alternatives.module.scss';

import { TextHighlight, TextImportant, TextLink } from '../components/text';
import React, { useMemo } from 'react';

import { Arrow as ArrowIcon } from '../components/icons';
import MailListIllustration from '../components/landing/illustration';
import SubpageLayout from '../layouts/subpage-layout';
import Testimonial, {
  PublicationQuote
} from '../components/landing/testimonial';
import broomImg from '../assets/enterprise/broom.png';
import envelopeImg from '../assets/open-envelope-love.png';
import lockImg from '../assets/security/lock.png';
import logo from '../assets/logo.png';
import numeral from 'numeral';
import request from '../utils/request';
import terrance from '../assets/testimonials/terrance.png';
import useAsync from 'react-use/lib/useAsync';

const metaImgUrl = `${process.env.CDN_URL}/images/meta/leave-me-alone-vs-unroll-me.png`;
const lifehackerImgUrl =
  'https://cdn.leavemealone.app/images/news/lifehacker-logo.png';

function UnrollMeAlternative() {
  const {
    error: statsError,
    // loading: statsLoading,
    value: statsData
  } = useAsync(fetchStats, []);

  const statsContent = useMemo(() => {
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
            {/* The privacy-focused Unroll.Me alternative you've been looking for */}
            {/* An Unroll.Me alternative that doesn't sell your data, ever */}
            <p styleName="tagline">
              Leave Me Alone is an Unroll.Me alternative that's{' '}
              <TextImportant>privacy-focused</TextImportant>, easy to use, and
              available in the EU.
            </p>
            <a href="/signup" className={`beam-me-up-cta`}>
              Get Started for Free
            </a>
            {statsContent}
          </div>
          <div styleName="container-image">
            <MailListIllustration />
          </div>
        </div>
      </div>

      <div styleName="alternative-inner">
        <PublicationQuote
          centered
          text={
            <span>
              That is why you should pay money for Leave Me Alone,{' '}
              <TextHighlight>
                an email unsubscription service that doesn’t sell user data
              </TextHighlight>
              .
            </span>
          }
          name="Lifehacker"
          image={lifehackerImgUrl}
        />
      </div>

      {/* Comparison table */}
      <div styleName="alternative-inner">
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
              <td styleName="cell">No</td>
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
        <div styleName="testimonial">
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
            author="Terrance Kwok, Product Manager, Chili Piper"
            image={terrance}
            centered
          />
        </div>
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
              <h3 styleName="feature-title">???</h3>
              <p>???</p>
              <p>
                <TextLink as="link" linkTo="/security">
                  ??? <ArrowIcon inline width="12" height="12" />
                </TextLink>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div styleName="alternative-inner end-stuff">
        <h2>We're the Unroll.Me alternative you can trust.</h2>
        <p>
          Sign up to Leave Me Alone to unsubscribe from unwanted emails (for
          real) without compromising your personal information.
        </p>
        <a
          href="/signup"
          event={'clicked-unroll-me-alternative-cta'}
          className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert`}
          style={{ margin: '50px auto' }}
        >
          Start Unsubscribing
        </a>
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
