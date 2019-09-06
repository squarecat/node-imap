import './estimator.module.scss';

import {
  CARBON_BLACK_COFFEE,
  CARBON_DRIVING_1KM,
  CARBON_PER_EMAIL,
  CARBON_PLASTIC_BAG,
  PECENTAGE_EMAILS_SPAM,
  PERCENTAGE_UNSUBS,
  formatNumber,
  formatWeight
} from '../../utils/climate-stats';
import React, { useMemo, useState } from 'react';
import { TextImportant, TextLink } from '../../components/text';

import RangeInput from '../../components/form/range';
import _times from 'lodash.times';
import mailBoxImg from '../../assets/mailbox.png';
import smallLogo from '../../assets/logo.png';
import spamMailImg from '../../assets/spam-email.png';
import treeImg from '../../assets/climate/tree.png';

export default function Estimator({
  title = 'How much can I reduce my carbon footprint by?',
  startFrom = 20
}) {
  const [mailPerDay, setMailPerDay] = useState(startFrom);

  const mailPerMonth = mailPerDay === 0 ? 10 * 30 : mailPerDay * 30;
  const spamPerMonth = mailPerMonth * PECENTAGE_EMAILS_SPAM;
  const unsubsPerMonth = spamPerMonth * PERCENTAGE_UNSUBS;

  const recommendationContent = useMemo(
    () => {
      return getRecommendationContent(mailPerDay, unsubsPerMonth);
    },
    [mailPerDay, unsubsPerMonth]
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
              max="310"
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
              <div styleName="count-label">unwanted</div>
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
      {recommendationContent}
    </div>
  );
}

function getRecommendationContent(mailPerDay, unsubsPerMonth) {
  const carbonSavedPerMonth = unsubsPerMonth * CARBON_PER_EMAIL;
  const comparisonContent = getComparisonContent(carbonSavedPerMonth);

  const treeHalves = mailPerDay / 10;
  const wholeTrees = Math.round(treeHalves / 2);
  const showHalf = treeHalves % 2 === 0;

  return (
    <div styleName="recommendation recommendation-carbon">
      <div styleName="trees">
        {_times(wholeTrees, index => (
          <div styleName="tree" key={`tree-${index}`}>
            <img alt="deciduous tree in a cloud" src={treeImg} />
          </div>
        ))}
        {showHalf ? (
          <div styleName="tree half">
            <img alt="deciduous tree in a cloud" src={treeImg} />
          </div>
        ) : null}
      </div>

      <div>
        <p>
          We estimate that you can{' '}
          <TextImportant>
            reduce your carbon footprint by {formatWeight(carbonSavedPerMonth)}
          </TextImportant>{' '}
          if you unsubscribe from {formatNumber(unsubsPerMonth)} unwanted
          subscription emails.
        </p>
        {comparisonContent}
      </div>
    </div>
  );
}

function getComparisonContent(carbonSavedPerMonth) {
  const plasticBagsPerYear = (carbonSavedPerMonth / CARBON_PLASTIC_BAG) * 12;
  const coffeeSavedPerYear = (carbonSavedPerMonth / CARBON_BLACK_COFFEE) * 12;
  const drivingSavedPerYear = (carbonSavedPerMonth / CARBON_DRIVING_1KM) * 12;

  return (
    <div styleName="carbon-comparison">
      <p>This is the same as...</p>
      <ul>
        <li>
          Using{' '}
          <TextImportant>
            {formatNumber(plasticBagsPerYear)} fewer plastic bags
          </TextImportant>
        </li>
        <li>
          Drinking{' '}
          <TextImportant>
            {formatNumber(coffeeSavedPerYear)} fewer black coffees
          </TextImportant>
        </li>
        <li>
          Driving{' '}
          <TextImportant>
            {formatNumber(drivingSavedPerYear)}km less in a car
          </TextImportant>
        </li>
        {/* <li>
          Planting{' '}
          <TextImportant>
            {formatNumber(treesPlantedPerYear)} trees
          </TextImportant>
        </li> */}
      </ul>{' '}
      <p>
        ...in a single year.{' '}
        <TextLink undecorated href="#cite-5">
          <sup>[5]</sup>
        </TextLink>
      </p>
    </div>
  );
}
