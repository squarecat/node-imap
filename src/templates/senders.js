import './senders.module.scss';

import { TextImportant, TextLink } from '../components/text';

import { Arrow as ArrowIcon } from '../components/icons';
import { Enterprise } from '../pages/pricing';
import EnterpriseEstimator from '../components/estimator/enterprise';
import React from 'react';
import SubpageLayout from '../layouts/subpage-layout';
import Testimonial from '../components/landing/testimonial';
import _capitalize from 'lodash.capitalize';
import allSubscriptions from '../assets/mail-list-illustration.png';
import broom from '../assets/enterprise/broom.png';
import envelope from '../assets/open-envelope-love.png';
import googleLogo from '../assets/gsuite-logo.png';
import { graphql } from 'gatsby';
import happy from '../assets/enterprise/happy.png';
import luke from '../assets/luke.jpeg';
import officeLogo from '../assets/office-365-logo.png';
import securityImg from '../assets/security.png';

const ranks = {
  F: 0,
  E: 20,
  D: 30,
  C: 40,
  B: 50,
  A: 70,
  'A+': 90
};

const iconUrl = process.env.ICON_URL;

function SendersPage({ data }) {
  const { sendersJson } = data;
  const {
    domain,
    name: senderName,
    unsubscribes,
    seen,
    rank,
    slug
  } = sendersJson;
  let percentage = 0;
  if (unsubscribes === 0) {
    percentage = 0;
  } else {
    percentage = ((unsubscribes / seen) * 100).toFixed(2);
  }
  const imageUrl = `${iconUrl}${domain}`;
  const percentile = ranks[rank];
  const asArray = Object.keys(ranks);
  const negativePercentile = ranks[asArray[asArray.indexOf(rank) + 1]];
  const name = _capitalize(senderName);
  return (
    <SubpageLayout
      title={`Unsubscribe from ${name} with a single click`}
      description={''}
    >
      <div styleName="enterprise-inner">
        <div styleName="container intro-header">
          <div styleName="container-text">
            <h1 styleName="tagline">
              Unsubscribe easily from{' '}
              <span styleName="header-highlight"> {name}</span> emails
            </h1>
            <p styleName="description">
              Leave Me Alone lets you see all of your subscription emails in one
              place and unsubscribe from them with a single click.
            </p>

            <a href="/login" className={`beam-me-up-cta`}>
              Sign up for free
            </a>
            <p styleName="join-text">
              Join <TextImportant>{percentage}%</TextImportant> of users that
              unsubscribe from <TextImportant>{name}</TextImportant> emails
            </p>
          </div>
          <div styleName="container-image">
            <div styleName="unsubscribe-example-block">
              <div styleName="unsubscribe-illustation" />
              <div styleName="unsubscribe-illustation-addendum">
                <span styleName="company-image">
                  <img src={imageUrl} />
                </span>
                <span styleName="company-description">{`${name} emails`}</span>
              </div>
            </div>
          </div>
        </div>

        <div styleName="features">
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={happy} alt="happy face image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">
                Get rid of the emails you don't want
              </h3>
              <p>
                Receiving unwanted subscription emails, like the ones from{' '}
                <span styleName="highlight">{name}</span>, is a source of
                annoyance, frustration and interruption. Leave Me Alone makes it
                quick and easy to unsubscribe!
              </p>
            </div>
          </div>
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={broom} alt="broom sweeping image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">
                Clean all of your email accounts
              </h3>
              <p>
                If you have have emails from{' '}
                <span styleName="highlight">{name}</span> or any other unwanted
                subscriptons in your other accounts then you can connect all of
                them and clean all your inboxes in one go. Make email a
                productive tool again.
              </p>
            </div>
          </div>
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={envelope} alt="private envelope image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">Quickly see the worst spammers</h3>
              <p>
                <p>
                  <TextImportant>{name}</TextImportant> is{' '}
                  <TextImportant>
                    {percentile < 50 ? 'worse' : 'better'}
                  </TextImportant>{' '}
                  than{' '}
                  <TextImportant>
                    {percentile < 50 ? 100 - negativePercentile : percentile}%
                  </TextImportant>{' '}
                  of known senders, based on email frequency and reputation.
                </p>
                <p>
                  <TextImportant>
                    {(percentage * 100).toFixed(0)}%
                  </TextImportant>{' '}
                  of users unsubscribe from these emails.
                </p>
              </p>
            </div>
          </div>
        </div>
      </div>
      <p>
        <a href="https://clearbit.com">Logos provided by Clearbit</a>
      </p>
    </SubpageLayout>
  );
}

export default SendersPage;

export const query = graphql`
  query($id: String!) {
    sendersJson(id: { eq: $id }) {
      name
      score
      unsubscribes
      seen
      sender
      domain
      slug
    }
  }
`;
