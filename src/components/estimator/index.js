import './estimator.module.scss';

import React, { useMemo, useState } from 'react';

import RangeInput from '../../components/form/range';
import { TextImportant } from '../../components/text';
import mailBoxImg from '../../assets/mailbox.png';
import numeral from 'numeral';
import packageImg from '../../assets/package.png';
import smallLogo from '../../assets/envelope-logo.png';
import spamMailImg from '../../assets/spam-email.png';
import stampImg from '../../assets/stamp.png';
import truckImg from '../../assets/truck.png';

export default function Estimator({
  title,
  startFrom = 20,
  showTimeSaved = false
}) {
  const [mailPerDay, setMailPerDay] = useState(startFrom);

  const mailPerMonth = mailPerDay === 0 ? 10 * 30 : mailPerDay * 30;
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
          <h3 className="pricing-estimate-title">{title}</h3>
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
                From our anonymous usage data we can estimate how many
                unsubscribes you might need based on the size of your inbox.
              </p>
              <p>
                Approximately how much mail do you receive{' '}
                <TextImportant>each day?</TextImportant>
              </p>
            </>
          )}

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
              Around <TextImportant>8-10%</TextImportant> of all mail we scan is
              a subscription email
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
          {showTimeSaved ? (
            <>
              <p>
                You could easily save{' '}
                <TextImportant>
                  {`${numeral(unsubsPerMonth * 1.1).format('0,00')} minutes`}
                </TextImportant>{' '}
                of time spent reading email each month if these were gone{' '}
                <a styleName="cite-link" href="#cite-2">
                  <sup>[2]</sup>
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
          ) : null}
          {/* <p>
            The average person needs a huge{' '}
            <TextImportant>23 minutes</TextImportant> to get fully back on task
            after an interruption from email, so these unwanted emails could be
            costing your team an additional{' '}
            <TextImportant>
              {numeral((unsubsPerMonth * 32) / 60).format('0,00')} hours
            </TextImportant>{' '}
            each month in lost productivity!
          </p> */}
          {/* <p>{recommendationContent}</p> */}
        </div>
      </div>
    </div>
  );
}
