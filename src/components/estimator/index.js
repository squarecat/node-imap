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

export default function Estimator({
  title,
  startFrom = 20,
  showTimeSaved = false
}) {
  const [mailPerDay, setMailPerDay] = useState(startFrom);

  const mailPerMonth = mailPerDay === 0 ? 10 * 30 : mailPerDay * 30;
  const spamPerMonth = mailPerMonth * 0.08;
  const unsubsPerMonth = spamPerMonth * 0.36;

  const recommendationContent = useMemo(
    () => {
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
    },
    [unsubsPerMonth]
  );

  {
    /* const {
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
            Wow, that's a lot of emails! We recommend you{' '}
            <a href="mailto:hello@leavemealone.app">contact us</a> for a{' '}
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
  ); */
  }

  return (
    <div styleName="pricing-estimates">
      <div styleName="pricing-estimator">
        <div styleName="pricing-estimate-text">
          <h3>{title}</h3>
          {showTimeSaved ? (
            <>
              <p>
                From our anonymous usage data we can estimate how much time your
                company can save based on your number of employees.
              </p>
              <p>Approximately how many people work in your office?</p>
            </>
          ) : (
            <>
              <p>
                From our anonymous usage data we can estimate how many credits
                you might need based on the size of your inbox.
              </p>
              <p>
                Approximately how much mail do you receive{' '}
                <TextImportant>each day?</TextImportant>
              </p>
            </>
          )}

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
          {showTimeSaved ? (
            <>
              <p>
                You could easily save{' '}
                <TextImportant>
                  {`${numeral(unsubsPerMonth * 1.1).format('0,00')} minutes`}
                </TextImportant>{' '}
                of time spent reading email each month if these were gone{' '}
                <a styleName="cite-link" href="#cite-2">
                  <sup>[3]</sup>
                </a>
                .
              </p>
              <p>
                That's{' '}
                <TextImportant>
                  {`${numeral((unsubsPerMonth * 1.1 * 12) / 60).format(
                    '0,00'
                  )} hours`}
                </TextImportant>{' '}
                a year!
              </p>
            </>
          ) : (
            recommendationContent
          )}
        </div>
      </div>
    </div>
  );
}
