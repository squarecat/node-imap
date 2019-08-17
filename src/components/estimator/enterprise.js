import './estimator.module.scss';

import React, { useState } from 'react';
import { addMinutes, distanceInWordsStrict } from 'date-fns';

import RangeInput from '../../components/form/range';
import { TextImportant } from '../../components/text';
import mailBoxImg from '../../assets/mailbox.png';
import numeral from 'numeral';
// import packageImg from '../../assets/package.png';
import smallLogo from '../../assets/logo.png';
import spamMailImg from '../../assets/spam-email.png';

// import stampImg from '../../assets/stamp.png';
// import truckImg from '../../assets/truck.png';

const avgMailPerDay = 96;

export default function EnterpriseEstimator({ title, startFrom = 20 }) {
  const [numEmployees, setNumEmployees] = useState(startFrom);

  const mailPerDay = avgMailPerDay * numEmployees;
  const mailPerMonth = mailPerDay === 0 ? 10 * 30 : mailPerDay * 30;
  const spamPerMonth = mailPerMonth * 0.08;
  const unsubsPerMonth = spamPerMonth * 0.36;

  const minutesSavedPerMonth = unsubsPerMonth * 1.1;
  const minutesSavedPerYear = minutesSavedPerMonth * 12;
  const now = new Date();
  const distance = distanceInWordsStrict(
    now,
    addMinutes(now, minutesSavedPerMonth)
  );
  const distancePerYear = distanceInWordsStrict(
    now,
    addMinutes(now, minutesSavedPerYear * 3)
  );
  return (
    <div styleName="pricing-estimates">
      <div styleName="pricing-estimator">
        <div styleName="pricing-estimate-text">
          <h3>{title}</h3>

          <p>
            From our anonymous usage data we can estimate how much time your
            company can save based on your number of employees.
          </p>
          <p>Approximately how many people work at your company?</p>

          <RangeInput
            min="2"
            max="999"
            value={numEmployees}
            step="1"
            onChange={setNumEmployees}
            label={numEmployees}
          />
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
              <p style={{ margin: 0 }}>
                Your offices receives approximately this many emails per month{' '}
                <a styleName="cite-link" href="#cite-3">
                  <sup>[3]</sup>
                </a>
              </p>
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
              <div styleName="count-label">are unwanted</div>
            </div>
            <div styleName="count-icon">
              <img
                styleName="envelope-image"
                src={smallLogo}
                alt="envelope icon with Leave Me Alone logo"
              />
            </div>
            <div styleName="count-description">
              Our users report around <TextImportant>36%</TextImportant> of the
              subscriptions we find are unwanted
            </div>
          </div>
        </div>
      </div>
      <div styleName="recommendation">
        <div styleName="recommendation-description">
          <h2>
            Save <TextImportant>{distancePerYear} of work time</TextImportant>{' '}
            each year!
          </h2>
          <p>
            We estimate your company of {numEmployees} employees receives around{' '}
            <TextImportant>
              {`${numeral(unsubsPerMonth).format(
                '0,00'
              )} unwanted subscription emails `}
            </TextImportant>{' '}
            each month.
          </p>

          <>
            <p>
              Collectively you could save{' '}
              <TextImportant>{`${distance}`} of time</TextImportant> otherwise
              spent reading email each month if these were gone.{' '}
              <a styleName="cite-link" href="#cite-4">
                <sup>[4]</sup>
              </a>
            </p>
            <p>
              That's{' '}
              <TextImportant>
                {distancePerYear} of work time savings
              </TextImportant>{' '}
              each year based on an 8-hour workday.
            </p>
          </>

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
