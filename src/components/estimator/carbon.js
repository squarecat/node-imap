import './estimator.module.scss';

import React, { useMemo, useState } from 'react';

import RangeInput from '../../components/form/range';
import { TextImportant, TextLink } from '../../components/text';
import mailBoxImg from '../../assets/mailbox.png';
import numeral from 'numeral';
import smallLogo from '../../assets/logo.png';
import spamMailImg from '../../assets/spam-email.png';

const PECENTAGE_EMAILS_SPAM = 0.08;
const PERCENTAGE_UNSUBS = 0.36;
const DAYS_IN_MONTH = 30;
export const CARBON_PER_EMAIL = 4;
export const LONDON_PARIS_CARBON = 30000;
const CARBON_PLASTIC_BAG = 10;
export const CARBON_OFFSET_PER_TREE = 15694; // (34.6 pounds)
const CARBON_DRIVING_1KM = 260;

export default function Estimator({
  title = 'How much can I reduce my carbon footprint by?',
  startFrom = 20
}) {
  const [mailPerDay, setMailPerDay] = useState(startFrom);

  const mailPerMonth =
    mailPerDay === 0 ? 10 * DAYS_IN_MONTH : mailPerDay * DAYS_IN_MONTH;
  const spamPerMonth = mailPerMonth * PECENTAGE_EMAILS_SPAM;
  const unsubsPerMonth = spamPerMonth * PERCENTAGE_UNSUBS;

  const recommendationContent = useMemo(
    () => {
      const carbonSavedPerMonth = unsubsPerMonth * CARBON_PER_EMAIL;
      const treesPlantedPerYear =
        (carbonSavedPerMonth / CARBON_OFFSET_PER_TREE) * 12;
      const plasticBagsPerYear =
        (carbonSavedPerMonth / CARBON_PLASTIC_BAG) * 12;
      const drivingSavedPerYear =
        (carbonSavedPerMonth / CARBON_DRIVING_1KM) * 12;

      return (
        <>
          <p>
            We estimate you receive around{' '}
            <TextImportant>
              {formatNumber(unsubsPerMonth)} unwanted subscription emails{' '}
            </TextImportant>{' '}
            each month.
          </p>
          <p>
            Unsubscribing from these could{' '}
            <TextImportant>
              reduce your carbon footprint by{' '}
              {formatNumber(carbonSavedPerMonth)}g
            </TextImportant>
            .
          </p>
          <p>
            This is the same as{' '}
            <TextImportant>
              using {formatNumber(plasticBagsPerYear)} fewer plastic bags
            </TextImportant>
            ,{' '}
            <TextImportant>
              driving {formatNumber(drivingSavedPerYear)}km less
            </TextImportant>
            , or{' '}
            <TextImportant>
              planting {formatNumber(treesPlantedPerYear)} trees
            </TextImportant>{' '}
            each year.{' '}
            <TextLink undecorated href="#cite-5">
              <sup>[5]</sup>
            </TextLink>
          </p>
        </>
      );
    },
    [unsubsPerMonth]
  );

  return (
    <div styleName="pricing-estimates">
      <div styleName="pricing-estimator">
        <div styleName="pricing-estimate-text">
          <h3>{title}</h3>
          <p>
            From our anonymous usage data we can estimate how much you can
            reduce your carbon footprint by unsubscribing from unwanted
            subscription emails.
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
        </div>
        <div styleName="pricing-estimate-values">
          <div styleName="count">
            <div styleName="count-value">
              <div styleName="count-number">{formatNumber(mailPerMonth)}</div>
              <div styleName="count-label">emails</div>
            </div>
            <div styleName="count-icon">
              <img src={mailBoxImg} />
            </div>
            <div styleName="count-description">
              You receive approximately this many emails per month
            </div>
          </div>
          <div styleName="count">
            <div styleName="count-value">
              <div styleName="count-number">{formatNumber(spamPerMonth)}</div>
              <div styleName="count-label">subscriptions</div>
            </div>
            <div styleName="count-icon">
              <img src={spamMailImg} />
            </div>
            <div styleName="count-description">
              Around <TextImportant>8-10%</TextImportant> of all mail we scan is
              a subscription email
            </div>
          </div>
          <div styleName="count">
            <div styleName="count-value">
              <div styleName="count-number">{formatNumber(unsubsPerMonth)}</div>
              <div styleName="count-label">unsubscribes</div>
            </div>
            <div styleName="count-icon">
              <img styleName="envelope-image" src={smallLogo} />
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
          {recommendationContent}
        </div>
      </div>
    </div>
  );
}

function formatNumber(num) {
  return numeral(num).format('0,00');
}
