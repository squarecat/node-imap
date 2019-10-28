import './estimator.module.scss';

import React, { useMemo, useState } from 'react';

import PlanImage from '../../components/pricing/plan-image';
import RangeInput from '../../components/form/range';
import { TextImportant } from '../../components/text';
import { getRecommendation } from '../../../shared/prices';
import mailBoxImg from '../../assets/mailbox.png';
import numeral from 'numeral';
import smallLogo from '../../assets/logo.png';
import spamMailImg from '../../assets/spam-email.png';

// import stampImg from '../../assets/stamp.png';
// import truckImg from '../../assets/truck.png';

export default function Estimator({ title, startFrom = 20 }) {
  const [mailPerDay, setMailPerDay] = useState(startFrom);

  const mailPerMonth = mailPerDay === 0 ? 10 * 30 : mailPerDay * 30;
  const spamPerMonth = mailPerMonth * 0.08;
  const unsubsPerMonth = spamPerMonth * 0.36;

  const recommendationContent = useMemo(() => {
    const recommendedPackage = getRecommendation(unsubsPerMonth);
    if (recommendedPackage) {
      return (
        <>
          <div styleName="recommendation-package">
            <PlanImage type="package" compact />
            <div>
              <p>
                We recommend a package of{' '}
                <TextImportant>
                  {recommendedPackage.credits} credits for $
                  {(recommendedPackage.price / 100).toFixed(2)}
                </TextImportant>
                .
              </p>
              {recommendedPackage.discount ? (
                <p>
                  You'll get a {recommendedPackage.discount * 100}% bulk
                  discount!
                </p>
              ) : null}
            </div>
          </div>
          <a href="/signup" className={`beam-me-up-cta`}>
            Start Unsubscribing
          </a>
        </>
      );
    }
    return (
      <>
        <div styleName="recommendation-package">
          <PlanImage type="enterprise" compact />
          Wow, that's a lot of emails! We recommend you contact us for a{' '}
          <TextImportant>custom package</TextImportant> rate.
        </div>
        <a href="mailto:hello@leavemealone.app" className={`beam-me-up-cta`}>
          Contact Us
        </a>
      </>
    );
  }, [unsubsPerMonth]);

  return (
    <div styleName="pricing-estimates">
      <div styleName="pricing-estimator">
        <div styleName="pricing-estimate-text">
          <h3>{title}</h3>
          <p>
            From our anonymous usage data we can estimate how many credits you
            might need based on the size of your inbox.
          </p>
          <p>
            Approximately how much mail do you receive{' '}
            <TextImportant>each day?</TextImportant>
          </p>
          <div styleName="slider">
            <RangeInput
              min="10"
              max="300"
              value={mailPerDay}
              step="10"
              onChange={setMailPerDay}
              label={mailPerDay}
            />
          </div>
          {/* <div style={{ marginTop: 10 }}>{mailPerDayLabel}</div> */}
        </div>
        <div styleName="pricing-estimate-values">
          <div styleName="count">
            <div styleName="count-value">
              <div styleName="count-number">
                {numeral(mailPerMonth).format('0,00')}
              </div>
              <div styleName="count-label">emails</div>
            </div>
            <div styleName="count-icon">
              <img src={mailBoxImg} alt="mail box icon" />
            </div>
            <div styleName="count-description">
              You receive approximately this many emails per month
            </div>
          </div>
          <div styleName="count">
            <div styleName="count-value">
              <div styleName="count-number">
                {numeral(spamPerMonth).format('0,00')}
              </div>
              <div styleName="count-label">subscriptions</div>
            </div>
            <div styleName="count-icon">
              <img src={spamMailImg} alt="envelope icon" />
            </div>
            <div styleName="count-description">
              Around <TextImportant>8-10%</TextImportant> of all mail we scan is
              a subscription email
            </div>
          </div>
          <div styleName="count">
            <div styleName="count-value">
              <div styleName="count-number">
                {numeral(unsubsPerMonth).format('0,00')}
              </div>
              <div styleName="count-label">unsubscribes</div>
            </div>
            <div styleName="count-icon">
              <img
                styleName="envelope-image"
                src={smallLogo}
                alt="envelope icon with Leave Me Alone logo"
              />
            </div>
            <div styleName="count-description">
              Users report around <TextImportant>36%</TextImportant> of the
              subscriptions we find are unwanted
            </div>
          </div>
        </div>
      </div>
      <div styleName="recommendation">
        <div styleName="recommendation-description">
          <p>
            We estimate you receive around{' '}
            <TextImportant>
              {`${numeral(unsubsPerMonth).format(
                '0,00'
              )} unwanted subscription emails `}
            </TextImportant>{' '}
            each month.
          </p>

          {recommendationContent}
        </div>
      </div>
    </div>
  );
}
