import './climate.module.scss';

import {
  CARBON_LONDON_PARIS,
  CARBON_OFFSET_PER_TREE_PER_YEAR,
  CARBON_PER_EMAIL,
  NEWSLETTERS_NEVER_OPENED,
  TONNES_CARBON_PER_YEAR,
  TONNE_CONVERSION
} from '../../utils/climate';
import Features, {
  Feature,
  FeatureImage,
  FeatureText,
  FeatureTitle
} from '../../components/landing/features';
import React, { useEffect, useState } from 'react';
import { TextImportant, TextLink } from '../../components/text';

import CarbonEstimator from '../../components/estimator/carbon';
import SubPageLayout from '../../layouts/subpage-layout';
import downImg from '../../assets/climate/down.png';
import numeral from 'numeral';
import oneTreePlantedLogo from '../../assets/climate/one-tree-planted/OneTreePlanted-logo-square-green.png';
import planeImg from '../../assets/climate/around-the-globe.png';
import rainbowImg from '../../assets/climate/rainbow.png';
import request from '../../utils/request';
import treeImg from '../../assets/climate/tree.png';
import useAsync from 'react-use/lib/useAsync';

const TREE_ORG_LINK = 'https://onetreeplanted.org';

const title = `Clean your Inbox and Save the Planet`;
const description = `Emails dump ${TONNES_CARBON_PER_YEAR} tonnes of CO2 into the atmosphere ever year. Unsubscribe from unwanted subscription emails and reduce your carbon footprint.`;
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
        const totalCarbonSavedInGrams = unsubscriptions * CARBON_PER_EMAIL;
        setStats({
          users,
          unsubscriptions,
          totalCarbonSavedInGrams,
          londonToParis: (
            totalCarbonSavedInGrams / CARBON_LONDON_PARIS
          ).toFixed(0)
        });
      }
    },
    [statsData, statsError, statsLoading]
  );

  return (
    <SubPageLayout
      title={title}
      description={description}
      withContent={false}
      slug={slug}
    >
      <div styleName="climate-inner">
        <div styleName="container">
          <div styleName="container-text">
            <h1 styleName="title">Clean your Inbox. Save the Planet.</h1>
            <p styleName="tagline">
              Emails dump {formatNumber(TONNES_CARBON_PER_YEAR)} tonnes of{' '}
              <CO2 /> into the atmosphere ever year. Unsubscribe from unwanted
              subscription emails and reduce your carbon footprint.{' '}
              <TextLink undecorated href="#cite-1">
                <sup>[1]</sup>
              </TextLink>
              <TextLink undecorated href="#cite-2">
                <sup>[2]</sup>
              </TextLink>
            </p>
            {/* <p styleName="tagline">
              One email produces {CARBON_PER_EMAIL}g of carbon.{' '}
              {EMAILS_SENT_PER_DAY} billion emails are sent every day.
              Unsubscribe from unwanted subscription emails and reduce your
              carbon footprint.{' '}
              <TextLink undecorated href="#cite-1">
                <sup>[1]</sup>
              </TextLink>
              <TextLink undecorated href="#cite-6">
                <sup>[6]</sup>
              </TextLink>
            </p> */}
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
        <Features>
          <Feature>
            <FeatureImage>
              <img src={downImg} alt="cartoon cloud with a down arrow" />
            </FeatureImage>
            <FeatureTitle>Reduce Carbon Footprint</FeatureTitle>
            <FeatureText>
              {!stats ? (
                <p>Loading...</p>
              ) : (
                <p>
                  We have unsubscribed from{' '}
                  {formatNumber(stats.unsubscriptions)} subscription emails,{' '}
                  <TextImportant>
                    saving {formatWeightTonnes(stats.totalCarbonSavedInGrams)}{' '}
                    in <CO2 /> emissions
                  </TextImportant>
                  .{' '}
                  <TextLink undecorated href="#cite-1">
                    <sup>[1]</sup>
                  </TextLink>
                </p>
              )}
            </FeatureText>
          </Feature>

          <Feature>
            <FeatureImage>
              <img
                src={planeImg}
                alt="cartoon cloud with plane flying around a globe"
              />
            </FeatureImage>
            <FeatureTitle>Offset Flight Emissions</FeatureTitle>
            <FeatureText>
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
                  <TextLink undecorated href="#cite-3">
                    <sup>[3]</sup>
                  </TextLink>
                </p>
              )}
            </FeatureText>
          </Feature>

          <Feature>
            <FeatureImage>
              <img src={rainbowImg} alt="cartoon cloud with a rainbow" />
            </FeatureImage>
            <FeatureTitle>Improve The Atmosphere</FeatureTitle>
            <FeatureText>
              {!stats ? (
                <p>Loading...</p>
              ) : (
                <p>
                  Unsubscribing from those emails is the same carbon reduction
                  as{' '}
                  <TextImportant>
                    planting{' '}
                    {formatNumber(
                      stats.totalCarbonSavedInGrams /
                        CARBON_OFFSET_PER_TREE_PER_YEAR
                    )}{' '}
                    trees every year
                  </TextImportant>
                  .{' '}
                  <TextLink undecorated href="#cite-4">
                    <sup>[4]</sup>
                  </TextLink>
                </p>
              )}
            </FeatureText>
          </Feature>
        </Features>
      </div>

      <div styleName="climate-inner">
        <CarbonEstimator />
      </div>

      <div styleName="donate">
        <div styleName="climate-inner">
          <div styleName="image-section">
            <div styleName="image-section-text">
              <h2>Donate $1 and we plant one tree</h2>
              <p>
                Trees help clean the air we breathe, filter the water we drink,
                and absorb harmful carbon from the atmosphere.
              </p>
              <p>
                One tree absorbs{' '}
                {formatNumber(CARBON_OFFSET_PER_TREE_PER_YEAR / 100)}kg of
                carbon in a single year{' '}
                <TextLink undecorated inverted href="#cite-4">
                  <sup>[4]</sup>
                </TextLink>
                . That's equivalent to unsubscribing from{' '}
                {formatNumber(
                  CARBON_OFFSET_PER_TREE_PER_YEAR / CARBON_PER_EMAIL
                )}{' '}
                subscription emails!
              </p>
              <p>
                Donate one dollar at the checkout to plant a tree. We plant an
                additional tree for every 10 our customers do!
              </p>
            </div>
            <div styleName="image-section-img">
              <a href={TREE_ORG_LINK}>
                <img src={oneTreePlantedLogo} alt="One Tree Planted logo" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div styleName="climate-inner questions">
        <div styleName="question">
          <h2>Will unsubscribing really make a difference?</h2>
          <p>
            Yes!{' '}
            <TextImportant>
              {NEWSLETTERS_NEVER_OPENED * 100}% of emails are never opened
            </TextImportant>{' '}
            <TextLink undecorated href="#cite-6">
              <sup>[6]</sup>
            </TextLink>
            . Deleting these emails or setting rules to move them into a folder
            doesn't stop the carbon impact of receiving the email. By
            unsubscribing from unwanted mailing lists you can stop the email
            from being sent at all.
          </p>
          <p>
            You will also help the senders to reduce their carbon footprint and
            improve the quality of their mailing lists, which helps all Leave Me
            Alone users!
          </p>
        </div>
        <div styleName="question">
          <h2>How can emails contribute to carbon emissions?</h2>
          <p>
            The carbon impact of digital activity is calculated in terms of the
            greenhouse gases that are produced when running servers, computers,
            routers etc.
          </p>
          <p>
            The{' '}
            <TextImportant>
              gigantic data centers that power the internet consume vast amounts
              of electricity and water
            </TextImportant>
            . Storing, moving, processing, and analyzing data all require
            energy. Keeping everything cool and running efficiently requires
            water.
          </p>
          <p>
            The carbon footprint of something also includes the greenhouse gases
            emitted when the equipment was manufactured.
          </p>
          <p>
            With all of these things taken into account, a legitimate email
            emits on average 4 grams of <CO2 />.{' '}
            <TextLink undecorated href="#cite-1">
              <sup>[1]</sup>
            </TextLink>
          </p>
        </div>
        <div styleName="question">
          <h2>What else can I do to help reduce my carbon footprint?</h2>
          <p>Resources for reducing carbon emissions...</p>
          <p>TODO write more here...</p>
        </div>
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
                <a href="https://www.radicati.com/wp/wp-content/uploads/2015/02/Email-Statistics-Report-2015-2019-Executive-Summary.pdf">
                  In 2019, the Total Worldwide Emails Sent/Received Per Day is
                  246.5 (B)
                </a>
              </cite>
            </li>
            <li id="cite-3">
              <sup>[3]</sup>
              <cite>
                <a href="https://www.carbonfootprint.com">
                  Economy class direct one way flight from LON to PAR is 0.03
                  tonnes (30000g) of CO2
                </a>
              </cite>
            </li>
            <li id="cite-4" styleName="multiple">
              <sup>[4]</sup>
              <cite>
                <div>
                  <a href="https://trees.org/carboncalculator">
                    A tree in a Forest Garden sequesters a rate of 34.6 pounds
                    (15694g) of carbon per tree
                  </a>
                </div>
                <div>
                  <a href="https://archpaper.com/2017/07/trees-sequester-carbon-myth/">
                    The average amount each tree was likely to sequester was 88
                    pounds (39916g) per tree per year
                  </a>
                </div>
                <div>
                  <a href="http://www.unm.edu/~jbrink/365/Documents/Calculating_tree_carbon.pdf">
                    How to calculate the amount of CO2 sequestered in a tree per
                    year
                  </a>
                </div>
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
            <li id="cite-6">
              <sup>[6]</sup>
              <cite>
                <a href="https://www.smartinsights.com/email-marketing/email-communications-strategy/statistics-sources-for-email-marketing/">
                  In 2018, the average open rate across all industries is 24.8%
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

function formatWeightTonnes(weight) {
  const val = formatNumber(weight / TONNE_CONVERSION);
  const text = val > 1 ? 'tonnes' : 'tonne';
  return (
    <span>
      {val} {text}
    </span>
  );
}

function CO2() {
  return (
    <span>
      CO<sub>2</sub>
    </span>
  );
}
