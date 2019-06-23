import './estimator.module.scss';

import React, { useMemo, useState } from 'react';
import { addMinutes, distanceInWordsStrict } from 'date-fns';

import RangeInput from '../../components/form/range';
import { TextImportant } from '../../components/text';
import mailBoxImg from '../../assets/mailbox.png';
import numeral from 'numeral';
import packageImg from '../../assets/package.png';
import smallLogo from '../../assets/envelope-logo.png';
import spamMailImg from '../../assets/spam-email.png';
import stampImg from '../../assets/stamp.png';
import truckImg from '../../assets/truck.png';

const avgMailPerDay = 96;

export default function EnterpriseEstimator({ title, startFrom = 2 }) {
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
    addMinutes(now, minutesSavedPerYear)
  );
  return (
    <div className="pricing-estimates">
      <div className="pricing-estimator">
        <div className="pricing-estimate-text">
          <h3 className="pricing-estimate-title">{title}</h3>

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
              <p style={{ margin: 0 }}>
                Your offices receives approximately this many emails per month
                <a styleName="cite-link" href="#cite-2">
                  <sup>[2]</sup>
                </a>
              </p>
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
              <div className="count-label">are unwanted</div>
            </div>
            <div className="count-icon">
              <img className="envelope-image" src={smallLogo} />
            </div>
            <div className="count-description">
              Our users report around <TextImportant>36%</TextImportant> of the
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
            We estimate your company receives around{' '}
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
              <TextImportant>{`${distance}`}</TextImportant> of time otherwise
              spent reading email each month if these were gone{' '}
              <a styleName="cite-link" href="#cite-3">
                <sup>[3]</sup>
              </a>
              .
            </p>
            <p>
              That's <TextImportant>{distancePerYear}</TextImportant> a year!
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
