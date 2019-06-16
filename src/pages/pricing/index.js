import { ENTERPRISE, getPackage } from '../../../shared/prices';
import React, { useMemo, useState } from 'react';

import { Link } from 'gatsby';
import RangeInput from '../../components/form/range';
import SubPageLayout from '../../layouts/subpage-layout';
import { TextImportant } from '../../components/text';
import mailBoxImg from '../../assets/mailbox.png';
import numeral from 'numeral';
import packageImg from '../../assets/package.png';
import smallLogo from '../../assets/envelope-logo.png';
import spamMailImg from '../../assets/spam-email.png';
import stampImg from '../../assets/stamp.png';
import truckImg from '../../assets/truck.png';

const Estimations = () => {
  const [mailPerDay, setMailPerDay] = useState('20');

  const mailPerMonth = mailPerDay === '0' ? 10 * 30 : mailPerDay * 30;
  const spamPerMonth = mailPerMonth * 0.08;
  const unsubsPerMonth = spamPerMonth * 0.36;

  const {
    mailPerDayLabel,
    recommendationImage,
    recommendationContent
  } = useMemo(
    () => {
      let mailPerDayLabel = '<10';
      if (parseInt(mailPerDay, 10) <= 10) {
        mailPerDayLabel = 'fewer than 10';
      } else if (parseInt(mailPerDay, 10) < 300) {
        mailPerDayLabel = mailPerDay;
      } else if (parseInt(mailPerDay, 10) >= 300) {
        mailPerDayLabel = '300+';
      }

      let recommendation;
      let recommendationImage;
      if (unsubsPerMonth < 45) {
        recommendationImage = stampImg;
        recommendation = (
          <span>
            We recommend you start on the{' '}
            <TextImportant>Usage based plan</TextImportant>, if you receive more
            than 85 unwanted subscription emails then it would be better to
            switch to a package.
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
      return {
        recommendationContent: recommendation,
        recommendationImage,
        mailPerDayLabel
      };
    },
    [mailPerDay, unsubsPerMonth]
  );
  return (
    <div className="pricing-estimates">
      <div className="pricing-estimator">
        <div className="pricing-estimate-text">
          <h3 className="pricing-estimate-title">
            How many unsubscribes do I need?
          </h3>
          <p>
            From our anonymous usage data we can estimate how many unsubscribes
            you might need based on the size of your inbox.
          </p>
          <p>
            Approximately how much mail do you receive{' '}
            <TextImportant>each day?</TextImportant>
          </p>
          <RangeInput
            min="10"
            max="300"
            value={mailPerDay}
            step="10"
            onChange={setMailPerDay}
            label={mailPerDay}
          />
          {/* <div style={{ marginTop: 10 }}>{mailPerDayLabel}</div> */}
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
              You receive approximately this many emails per month
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
              Around <TextImportant>8%</TextImportant> of all mail we scan is a
              subscription email
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
              Users report around <TextImportant>36%</TextImportant> of the
              subscriptions we find are unwanted
            </div>
          </div>
        </div>
      </div>
      <div className="recommendation">
        {/* <div className="recommendation-image">
          <img src={recommendationImage} />
        </div> */}
        <div className="recommendation-description">
          <p>
            We estimate you receive around{' '}
            <TextImportant>
              {`${numeral(unsubsPerMonth).format(
                '0,00'
              )} unwanted subscription emails `}
            </TextImportant>{' '}
            each month.
          </p>
          {/* <p>{recommendationContent}</p> */}
        </div>
      </div>
    </div>
  );
};

export function Pricing() {
  return (
    <>
      <div className="pricing-list-of-boxes-that-say-how-much">
        <div className="a-load-of-boxes-with-prices">
          <Packages readMore={true} />
          <Enterprise readMore={true} />
        </div>
      </div>
    </>
  );
}

export function Enterprise({ readMore = false }) {
  return (
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
      <a href="/" className={`beam-me-up-cta beam-me-up-cta-center`}>
        Contact us
      </a>
      {readMore ? (
        <div className="read-more">
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
    <div className="pricing-box" href="/login">
      <h3 className="pricing-title">Packages</h3>
      <img className="pricing-image" src={packageImg} />
      <span className="pricing-text">Starting at</span>
      <p className="pricing-price">
        <span className="currency">$</span>
        <span>{(price / 100).toFixed(2)}</span>
      </p>
      <span className="pricing-text">
        for <span>{credits}</span> credits
      </span>
      <span className="pricing-slider">
        <RangeInput
          min="1"
          max="4"
          value={packageValue}
          onChange={val => setPackageValue(val)}
        />
      </span>
      <ul className="pricing-features">
        <li>Gmail and Outlook support</li>
        <li className="coming-soon">Limited API access</li>
        <li className="coming-soon">Email forwarding</li>
        <li>Email and chat support</li>
        {discount ? (
          <li>
            <span>{discount * 100}</span>% bulk discount
          </li>
        ) : null}
      </ul>
      <a href="/login" className={`beam-me-up-cta beam-me-up-cta-center`}>
        Get started
      </a>
      {readMore ? (
        <div className="read-more">
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
    <SubPageLayout title="Pricing" description={``}>
      <div className="pricing-page">
        <div className="pricing-description">
          <h2>Pricing</h2>
          <p>
            So that we can provide a great, privacy focused service, we charge a
            small amount for each unsubscribe.
            <br />
          </p>
          <p>
            We offer several different sized packages of credits based on your
            needs.
          </p>
          <p>Each successful unsubscribe costs one credit.</p>

          <p>Check out how many unsubscribe credits you might need below.</p>
          <p>
            Or interested in our <TextImportant>Enterprise plans</TextImportant>
            ? Read about them <Link to="/enterprise">here</Link>.
          </p>
        </div>
        <Packages />
      </div>

      <Estimations />
      <div className="pricing-why" id="why">
        <h3 className="pricing-estimate-title">Why is it not free?</h3>
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
          how we manage all our data <Link to="/data">here</Link>.
        </p>

        <br />
        <a href="/login" className={`beam-me-up-cta beam-me-up-cta-center`}>
          Sign me up!
        </a>
      </div>
    </SubPageLayout>
  );
};
