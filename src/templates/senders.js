import './senders.module.scss';

import { TextImportant, TextLink } from '../components/text';

import { Arrow as ArrowIcon } from '../components/icons';
import React from 'react';
import SenderImage from './sender-image';
import SubpageLayout from '../layouts/subpage-layout';
import _capitalize from 'lodash.capitalize';
import _shuffle from 'lodash.shuffle';
import broom from '../assets/enterprise/broom.png';
import envelope from '../assets/open-envelope-love.png';
import { graphql } from 'gatsby';
import happy from '../assets/enterprise/happy.png';
import suggestions from '../senders/highest-occurrences.json';

const ranks = {
  F: 0,
  E: 20,
  D: 30,
  C: 40,
  B: 50,
  A: 70,
  'A+': 90
};

function SendersPage({ data }) {
  const { sendersJson } = data;
  const {
    domain,
    name: senderName,
    unsubscribes,
    seen,
    rank,
    addresses,
    slug
  } = sendersJson;

  const { percentage, percentile, negativePercentile } = getStats({
    unsubscribes,
    seen,
    rank
  });

  const name = _capitalize(senderName);

  const senderAddresses = joinArrayToSentence(addresses, 3);
  const suggestionNames = getSuggestions(senderName);

  return (
    <SubpageLayout
      title={`Unsubscribe from ${name} emails`}
      description={`Leave Me Alone makes it easy to unsubscribe from unwanted spam and subscription emails like ones from ${name}.`}
      slug={slug}
    >
      <div styleName="sender-inner">
        <div styleName="container intro-header">
          <div styleName="container-text">
            <h1 styleName="tagline">
              Easily unsubscribe from{' '}
              <span styleName="header-highlight">{name}</span> emails
            </h1>
            <p styleName="description">
              Leave Me Alone makes it easy to unsubscribe from unwanted spam and
              subscription emails like ones from {name}.
            </p>
            <div styleName="join-container">
              <a href="/signup" className={`beam-me-up-cta`}>
                Get started for FREE
              </a>
              <p styleName="join-text">
                Join <TextImportant>{unsubscribes}</TextImportant> of our users
                that have unsubscribed from{' '}
                <TextImportant>{name}</TextImportant> emails.
              </p>
            </div>
          </div>
          <div styleName="container-image">
            <div styleName="unsubscribe-example-block">
              <div styleName="unsubscribe-illustation" />
              <div styleName="unsubscribe-illustation-addendum">
                <span styleName="company-image" data-name={senderName}>
                  <SenderImage name={name} domain={domain} />
                </span>
                <span styleName="company-description">{`${name} Emails`}</span>
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
                Unsubscribe from all <span styleName="highlight">{name}</span>{' '}
                emails
              </h3>
              <p>
                {name} sends emails from{' '}
                {`${addresses.length} ${
                  addresses.length === 1 ? 'address' : 'addresses'
                }`}{' '}
                like {senderAddresses}. Stop {name} being a source of annoyance,
                frustration and interruption. Leave Me Alone makes it quick and
                easy to unsubscribe!
              </p>
              <p>
                <TextLink href="/learn">
                  Read how Leave Me Alone works{' '}
                  <ArrowIcon inline width="12" height="12" />
                </TextLink>
              </p>
            </div>
          </div>
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={broom} alt="broom sweeping image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">
                Clear <span styleName="highlight">{name}</span> from all of your
                inboxes
              </h3>
              <p>
                Connect all of your email accounts to unsubscribe from {name}{' '}
                and any other unwanted subscription emails in one go. Leave Me
                Alone supports Gmail, G Suite, Outlook, Office 365, Live, and
                Hotmail.
              </p>
              <p>
                <TextLink href="/learn">
                  See all Leave Me Alone features{' '}
                  <ArrowIcon inline width="12" height="12" />
                </TextLink>
              </p>
            </div>
          </div>
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={envelope} alt="private envelope image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">
                See if emails from <span styleName="highlight">{name}</span> are
                worth keeping
              </h3>
              <p>
                Quickly determine the quality of emails using our revolutionary
                ranking system. {name} is{' '}
                <TextImportant>
                  {percentile < 50 ? 'worse' : 'better'}
                </TextImportant>{' '}
                than{' '}
                <TextImportant>
                  {percentile < 50
                    ? 100 - (negativePercentile || 0)
                    : percentile || 0}
                  %
                </TextImportant>{' '}
                of known senders, based on email frequency and reputation.{' '}
                <TextImportant>{(percentage * 100).toFixed(0)}%</TextImportant>{' '}
                of users unsubscribe from {name} emails.
              </p>
              <p>
                <TextLink href="/security">
                  Learn how we power these stats{' '}
                  <ArrowIcon inline width="12" height="12" />
                </TextLink>
              </p>
            </div>
          </div>
        </div>

        <div styleName="end-stuff">
          <h2>
            Start unsubscribing from{' '}
            <TextImportant>{suggestionNames}</TextImportant> emails today.
          </h2>
          <a
            href={`/signup?ref=landing-${senderName}`}
            className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert beam-me-up-fit-long-stuff-please`}
            style={{ margin: '50px auto' }}
          >
            Unsubscribe from {name} emails now!
          </a>
          <p>Or...</p>
          <p>
            Check out <TextLink href="/learn">how it works</TextLink>, read
            about our <TextLink href="/security">security</TextLink>, and find
            out more <TextLink href="/about">about us and our mission</TextLink>
            .
          </p>
        </div>
      </div>
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
      addresses
    }
  }
`;

function getStats({ unsubscribes, seen, rank }) {
  let percentage = 0;
  if (unsubscribes === 0) {
    percentage = 0;
  } else {
    percentage = ((unsubscribes / seen) * 100).toFixed(2);
  }
  const percentile = ranks[rank];
  const asArray = Object.keys(ranks);
  const negativePercentile = ranks[asArray[asArray.indexOf(rank) + 1]];

  return {
    percentage,
    percentile,
    negativePercentile
  };
}

function joinArrayToSentence(addresses, limit, end) {
  let show = addresses;
  if (limit) {
    show = addresses.slice(0, limit);
  }
  if (show.length === 1) {
    return <span styleName="email-address">{show[0]}</span>;
  }
  if (show.length === 2) {
    return (
      <>
        <span styleName="email-address">{show[0]}</span> and{' '}
        <span styleName="email-address">{show[1]}</span>
      </>
    );
  }

  let last;
  if (end) {
    last = end;
  } else {
    last = <span styleName="email-address">{show.pop()}</span>;
  }
  return (
    <>
      {show.map(s => (
        <>
          <span styleName="email-address">{s}</span>,{' '}
        </>
      ))}
      and {last}
    </>
  );
}

function getSuggestions(senderName) {
  const filtered = _shuffle(
    suggestions.filter(s => s !== senderName).map(s => _capitalize(s))
  );
  const show = filtered.slice(0, 4);
  return joinArrayToSentence(show, 4, 'many more');
}
