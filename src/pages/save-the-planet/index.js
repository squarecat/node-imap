import './climate.module.scss';
import React, { useState, useEffect, useMemo } from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import treeImg from '../../assets/climate/tree.png';
import downImg from '../../assets/climate/down.png';
import planeImg from '../../assets/climate/around-the-globe.png';
import rainbowImg from '../../assets/climate/rainbow.png';
import useAsync from 'react-use/lib/useAsync';
import request from '../../utils/request';
import { TextImportant, TextLink } from '../../components/text';
import numeral from 'numeral';

import CarbonEstimator, {
  CARBON_PER_EMAIL,
  LONDON_PARIS_CARBON,
  CARBON_OFFSET_PER_TREE
} from '../../components/estimator/carbon';

const EMAILS_SENT_PER_DAY = 246.5; // 246500000000
const NEWSLETTERS_NEVER_OPENED = 0.75;
// 30000: "London to Paris",
// 480000: "London to New York",
// 1460000: "London to Sydney"

const title = `Save the Planet`;
// const description = `One email equates to ${CARBON_PER_EMAIL}g of CO2 a year and ${NEWSLETTERS_NEVER_OPENED *
//   100}% of mail is never opened.  Unsubscribe from unwanted subscription emails and reduce your carbon footprint.`;
const slug = `/save-the-planet`;

const ClimatePage = () => {
  const {
    error: statsError,
    loading: statsLoading,
    value: statsData
  } = useAsync(fetchStats, []);

  const [stats, setStats] = useState(null);

  useEffect(
    () => {
      if (!statsLoading && statsData) {
        const { users, unsubscriptions } = statsData;
        const carbon = unsubscriptions * CARBON_PER_EMAIL;
        setStats({
          users,
          unsubscriptions,
          totalCarbonSavedInGrams: carbon,
          totalCarbonSavedInTonnes: carbon / 1e6,
          londonToParis: (carbon / LONDON_PARIS_CARBON).toFixed(0)
        });
      }
    },
    [statsData, statsError, statsLoading]
  );

  return (
    <SubPageLayout
      title={title}
      // description={description}
      withContent={false}
      slug={slug}
    >
      <div styleName="climate-inner">
        <div styleName="container">
          <div styleName="container-text">
            <h1 styleName="title">Clean your Inbox. Save the Planet.</h1>
            <p styleName="tagline">
              One email equates to {CARBON_PER_EMAIL}g of carbon.{' '}
              {EMAILS_SENT_PER_DAY} billion emails are sent every day.
              Unsubscribe from unwanted subscription emails and reduce your
              carbon footprint.{' '}
              <TextLink undecorated href="#cite-1">
                <sup>[1]</sup>
              </TextLink>
              <TextLink undecorated href="#cite-4">
                <sup>[4]</sup>
              </TextLink>
            </p>
            <a href="/signup" className={`beam-me-up-cta`}>
              Make a difference
            </a>
          </div>
          <div styleName="container-image">
            <img alt="deciduous tree in a cloud" src={treeImg} />
          </div>
        </div>
      </div>

      <div styleName="climate-inner">
        <div styleName="features">
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={downImg} alt="cartoon cloud with a down arrow" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">Reduce Carbon Footprint</h3>
              {!stats ? (
                <p>Loading...</p>
              ) : (
                <p>
                  We have unsubscribed from{' '}
                  {formatNumber(stats.unsubscriptions)} subscription emails,{' '}
                  <TextImportant>
                    saving {formatNumber(stats.totalCarbonSavedInTonnes)}{' '}
                    {formatNumber(stats.totalCarbonSavedInTonnes) === 1
                      ? 'tonne'
                      : 'tonnes'}{' '}
                    in <CO2 /> emissions
                  </TextImportant>
                  .{' '}
                  <TextLink undecorated href="#cite-1">
                    <sup>[1]</sup>
                  </TextLink>
                </p>
              )}
            </div>
          </div>

          <div styleName="feature">
            <div styleName="feature-img">
              <img
                src={planeImg}
                alt="cartoon cloud with plane flying around a globe"
              />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">Offset Flight Emissions</h3>
              {!stats ? (
                <p>Loading...</p>
              ) : (
                <p>
                  Receiving those emails is equivalent to{' '}
                  <TextImportant>
                    {formatNumber(stats.londonToParis)} flights from London to
                    Paris
                  </TextImportant>{' '}
                  in carbon emissions.{' '}
                  <TextLink undecorated href="#cite-2">
                    <sup>[2]</sup>
                  </TextLink>
                </p>
              )}
            </div>
          </div>

          <div styleName="feature">
            <div styleName="feature-img">
              <img src={rainbowImg} alt="cartoon cloud with a raindbow" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">Improve The Atmosphere</h3>
              {!stats ? (
                <p>Loading...</p>
              ) : (
                <p>
                  Unsubscribing from those emails is the same carbon reduction
                  as{' '}
                  <TextImportant>
                    planting{' '}
                    {formatNumber(
                      stats.totalCarbonSavedInGrams / CARBON_OFFSET_PER_TREE
                    )}{' '}
                    trees
                  </TextImportant>
                  .{' '}
                  <TextLink undecorated href="#cite-3">
                    <sup>[3]</sup>
                  </TextLink>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div styleName="climate-inner">
        <CarbonEstimator />
      </div>

      <div styleName="climate-inner">
        <h2>Plant a tree and we donate to ...</h2>
        <p>
          Planting 1 tree offsets carbon footprint by {CARBON_OFFSET_PER_TREE}{' '}
          over it's lifetime
        </p>
        <p>
          Donate at the checkout to plant a tree and we will also donate to a
          charity (give them a selection for environment, privacy, and other 2)
        </p>
        <p>Donated so far...</p>
        <p>Trees planeted so far...</p>
      </div>

      <div styleName="climate-inner">
        <h2>Will unsubscribing really make a difference?</h2>
        <p>
          Yes! {NEWSLETTERS_NEVER_OPENED * 100}% of emails are never opened.
          Setting rules to archive, delete, or apply a label doesn't stop the
          carbon impact of receiving the email. By unsubscribing from mailing
          lists you stop the email from being sent at all.
        </p>
        <p>
          You will also help the senders to reduce their carbon footprint and
          improve the quality of their mailing lists.
        </p>

        <h2>How can emails contribute to carbon emissions?</h2>
        <p>
          The culprits are greenhouse gases produced in running the computer,
          server and routers but also those emitted when the equipment was
          manufactured.
        </p>
      </div>

      <div styleName="climate-inner">
        <div styleName="sources">
          <ul>
            <li id="cite-1">
              <sup>[1]</sup>
              <cite>
                <a href="https://img.en25.com/Web/McAfee/CarbonFootprint_12pagesfr_s_fnl2.pdf">
                  A legitimate email emits on average 4 grams of CO2
                </a>
              </cite>
            </li>
            <li id="cite-2">
              <sup>[2]</sup>
              <cite>
                <a href="https://www.carbonfootprint.com">
                  Economy class direct one way flight from LON to PAR is 0.03
                  tonnes of CO2
                </a>
              </cite>
            </li>
            <li id="cite-3">
              <sup>[3]</sup>
              <cite>
                <a href="https://trees.org/carboncalculator">
                  A tree in a Forest Garden sequesters a rate of 34.6 pounds
                  (15694g) of carbon per tree
                </a>
              </cite>
            </li>
            <li id="cite-4">
              <sup>[4]</sup>
              <cite>
                <a href="https://www.smartinsights.com/email-marketing/email-communications-strategy/statistics-sources-for-email-marketing/">
                  In 2018, the average open rate across all industries is 24.8%
                </a>
              </cite>
            </li>
            <li id="cite-5">
              <sup>[5]</sup>
              <cite>
                <a href="https://phys.org/news/2015-11-carbon-footprint-email.html">
                  The environmental impact of some common activities
                </a>
              </cite>
            </li>
          </ul>
        </div>
      </div>
    </SubPageLayout>
  );
};

export default ClimatePage;

function fetchStats() {
  return request('/api/stats?summary=true');
}

function formatNumber(num) {
  return numeral(num).format('0,0');
}

function CO2() {
  return (
    <span>
      CO<sub>2</sub>
    </span>
  );
}
