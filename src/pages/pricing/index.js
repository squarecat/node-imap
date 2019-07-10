import './pricing.module.scss';

import { ENTERPRISE, getPackage } from '../../../shared/prices';
import React, { useState } from 'react';
import SubPageLayout, { SubpageTagline } from '../../layouts/subpage-layout';
import { TextImportant, TextLink } from '../../components/text';

import Estimator from '../../components/estimator';
import { Link } from 'gatsby';
import RangeInput from '../../components/form/range';
import packageImg from '../../assets/package.png';
import truckImg from '../../assets/truck.png';

export function Pricing() {
  return (
    <>
      <div styleName="pricing-list-of-boxes-that-say-how-much">
        <div styleName="a-load-of-boxes-with-prices">
          <Packages readMore={true} />
          <Enterprise readMore={true} />
        </div>
      </div>
    </>
  );
}

export function Enterprise({ readMore = false }) {
  return (
    <div styleName="pricing-box">
      <h3 styleName="pricing-title">Enterprise</h3>
      <img styleName="pricing-image" src={truckImg} />
      <span styleName="pricing-text">Starting at</span>
      <p styleName="pricing-price">
        <span styleName="currency">$</span>
        {(ENTERPRISE.pricePerSeat / 100).toFixed(2)}
      </p>
      <span styleName="pricing-text">per seat/month</span>
      <div styleName="pricing-separator-container">
        <span styleName="pricing-separator" />
      </div>
      <ul styleName="pricing-features">
        {/* <li>Rid your office of useless email</li> */}
        <li>Google and Microsoft support</li>
        <li>Unlimited unsubscribes</li>
        <li styleName="coming-soon">
          Unlimited API access <span>(coming soon)</span>
        </li>
        <li styleName="coming-soon">
          Email forwarding <span>(coming soon)</span>
        </li>
        <li>Email, chat and phone support</li>
      </ul>
      <a
        href="mailto:hello@leavemealone.app"
        className={`beam-me-up-cta beam-me-up-cta-center`}
      >
        Contact us
      </a>
      {readMore ? (
        <div styleName="read-more">
          <p>
            <a href="/enterprise">or read more</a>
          </p>
        </div>
      ) : null}
    </div>
  );
}

function Packages({ readMore = false }) {
  const [packageValue, setPackageValue] = useState('1');
  let { credits, discount, price } = getPackage(packageValue);
  return (
    <div styleName="pricing-box">
      <h3 styleName="pricing-title">Packages</h3>
      <img styleName="pricing-image" src={packageImg} />
      <span styleName="pricing-text">Starting at</span>
      <p styleName="pricing-price">
        <span styleName="currency">$</span>
        <span>{(price / 100).toFixed(2)}</span>
      </p>
      <span styleName="pricing-text">
        for <span>{credits}</span> credits
      </span>
      <span styleName="pricing-slider">
        <RangeInput
          min="1"
          max="4"
          value={packageValue}
          onChange={val => setPackageValue(val)}
        />
      </span>
      <ul styleName="pricing-features">
        <li>Google and Microsoft support</li>
        <li>1 credit = 1 unsubscribe</li>
        <li styleName="coming-soon">
          Limited API access <span>(coming soon)</span>
        </li>
        <li styleName="coming-soon">
          Email forwarding <span>(coming soon)</span>
        </li>
        <li>Email and chat support</li>
        {discount ? (
          <li>
            <span>{discount * 100}</span>% bulk discount
          </li>
        ) : null}
      </ul>
      <a href="/signup" className={`beam-me-up-cta beam-me-up-cta-center`}>
        Get Started
      </a>
      {readMore ? (
        <div styleName="read-more">
          <p>
            <a href="/pricing">or read more</a>
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default () => {
  return (
    <SubPageLayout
      title="Pricing"
      description={`Whatever the size of your inbox our pricing has you covered.`}
    >
      <div styleName="pricing-page">
        <div styleName="pricing-description">
          <h1>Pricing</h1>
          <SubpageTagline>
            Whatever the size of your inbox our pricing has you covered.
          </SubpageTagline>
          <p>
            So that we can provide a great, privacy-focused service, we charge a
            small amount for each unsubscribe.
            <br />
          </p>
          <p>
            We offer several different sized packages of credits based on your
            needs.
          </p>
          <p>Each successful unsubscribe costs one credit.</p>

          <p>Check out how many unsubscribe credits you might need below.</p>
          <br />
          <p>
            Or learn more about{' '}
            <TextLink href="/enterprise">
              Leave Me Alone for Enterprise
            </TextLink>
            .
          </p>
        </div>
        <Packages />
      </div>

      <Estimator title="How many credits do I need?" />
      <div styleName="pricing-why" id="why">
        <h3>Why is it not free?</h3>
        <p>
          Some of our competitors offer a similar unsubscription service for
          free. They are able to do this because they make money by{' '}
          <TextImportant>
            aggregating and selling data generated from your emails
          </TextImportant>
          .
        </p>
        <p>
          You can read more about this on{' '}
          <a href="https://lifehacker.com/unroll-me-the-email-unsubscription-service-has-been-c-1794593445">
            The New York Times
          </a>
          ,{' '}
          <a href="https://techcrunch.com/2018/05/05/unroll-me-to-close-to-eu-users-saying-it-cant-comply-with-gdpr/">
            Life Hacker
          </a>
          ,{' '}
          <a href="https://www.theguardian.com/technology/2017/apr/24/unrollme-mail-unsubscription-service-heartbroken-sells-user-inbox-data-slice">
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
          At Leave Me Alone, we have made it our policy to{' '}
          <TextImportant>NEVER</TextImportant> compromise our users' privacy in
          this way.
        </p>
        <p>
          To further ensure this is never a possibility we don't even store any
          email information. Any emails we scan on your behalf are streamed
          directly to you and not stored by our system.
        </p>
        <p>
          This means you can be sure we will never exploit your data in order to
          keep our lights on.
        </p>
        <p>
          That said, we do store some completely anonymous data so that we can
          show fancy statistics (like the ones you see on the homepage), and
          power our Subscriber Score algorithm. You can read more about this and
          how we manage all our data <TextLink href="/security">here</TextLink>.
        </p>

        <br />
        <a href="/signup" className={`beam-me-up-cta beam-me-up-cta-center`}>
          Sign Me Up!
        </a>
      </div>

      <div styleName="more">
        <h2>Want to know more?</h2>
        <p>
          Check out <TextLink href="/learn">how it works</TextLink>, read about
          our <TextLink href="/security">security</TextLink>, and find out more{' '}
          <TextLink href="/about">about us and our mission</TextLink>.
        </p>
      </div>
    </SubPageLayout>
  );
};
