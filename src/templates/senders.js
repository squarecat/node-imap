import './senders.module.scss';

import { TextImportant, TextLink } from '../components/text';

import { Arrow as ArrowIcon } from '../components/icons';
import MailListIllustration from '../components/landing/illustration';
import React from 'react';
import SubpageLayout from '../layouts/subpage-layout';
import _shuffle from 'lodash.shuffle';
import broom from '../assets/enterprise/broom.png';
import envelope from '../assets/open-envelope-love.png';
import { graphql } from 'gatsby';
import happy from '../assets/enterprise/happy.png';
import suggestions from '../senders/highest-occurrences.json';

// const ranks = {
//   F: 0,
//   E: 20,
//   D: 30,
//   C: 40,
//   B: 50,
//   A: 70,
//   'A+': 90
// };

function SendersPage({ data }) {
  const { sendersJson } = data;
  const {
    domain,
    name,
    label,
    unsubscribes,
    seen,
    rank,
    addresses,
    slug
  } = sendersJson;

  const { percentage } = getStats({
    unsubscribes,
    seen,
    rank
  });

  const senderAddresses = getSenders(addresses, 2);
  const suggestionNames = getSuggestions(label);

  return (
    <SubpageLayout
      title={`Unsubscribe from ${label} emails`}
      description={`Leave Me Alone makes it easy to unsubscribe from unwanted spam and subscription emails like ones from ${label}.`}
      slug={slug}
    >
      <div styleName="container intro-header">
        <div styleName="container-text">
          <h1 styleName="tagline">
            Easily unsubscribe from{' '}
            <span styleName="header-highlight">{label}</span> emails
          </h1>
          <p styleName="description">
            Leave Me Alone makes it easy to unsubscribe from unwanted spam and
            subscription emails like ones from {label}.
          </p>
          <div styleName="join-container">
            <a href="/signup" className={`beam-me-up-cta`}>
              Get started for FREE
            </a>
            <p styleName="join-text">
              Join <TextImportant>{unsubscribes}</TextImportant> of our users
              that have unsubscribed from <TextImportant>{label}</TextImportant>{' '}
              emails.
            </p>
          </div>
        </div>
        <div styleName="container-image">
          <MailListIllustration sender={{ name, label, domain }} />
        </div>
      </div>

      <div styleName="features">
        <div styleName="feature">
          <div styleName="feature-img">
            <img src={happy} alt="happy face image" />
          </div>
          <div styleName="feature-text">
            <h3 styleName="feature-title">
              Unsubscribe from all <span styleName="highlight">{label}</span>{' '}
              emails
            </h3>
            <p>
              {label} sends emails from{' '}
              {`${addresses.length} ${
                addresses.length === 1 ? 'address' : 'addresses'
              }`}{' '}
              like {senderAddresses}. Stop {label} being a source of annoyance,
              frustration and interruption. Leave Me Alone makes it quick and
              easy to unsubscribe!
            </p>
            <p>
              <TextLink as="link" linkTo="/learn">
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
              Clear <span styleName="highlight">{label}</span> from all of your
              accounts
            </h3>
            <p>
              Connect all of your email accounts to unsubscribe from {label} and
              any other unwanted subscription emails in one go. Leave Me Alone
              supports Gmail, G Suite, Outlook, Office 365, Live, and Hotmail.
            </p>
            <p>
              <TextLink as="link" linkTo="/learn">
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
              See if <span styleName="highlight">{label}</span> emails are worth
              keeping
            </h3>
            <p>
              Quickly determine the quality of emails and see which senders spam
              you the most using our ranking system - Subscriber Score.{' '}
              <TextImportant>{percentage}%</TextImportant> of Leave Me Alone
              users unsubscribe from {label} emails.
            </p>
            <p>
              <TextLink as="link" linkTo="/security">
                Learn how we power these stats{' '}
                <ArrowIcon inline width="12" height="12" />
              </TextLink>
            </p>
          </div>
        </div>
      </div>

      <div styleName="end-stuff">
        <h2>
          Start unsubscribing from <span>{suggestionNames}</span> emails today.
        </h2>
        <a
          href={`/signup?ref=landing-${name}`}
          className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert beam-me-up-fit-long-stuff-please`}
          style={{ margin: '50px auto' }}
        >
          Unsubscribe from {label} emails now!
        </a>
        <p>Or...</p>
        <p>
          Check out{' '}
          <TextLink as="link" linkTo="/learn">
            how it works
          </TextLink>
          , read about our{' '}
          <TextLink as="link" linkTo="/security">
            security
          </TextLink>
          , and find out more{' '}
          <TextLink as="link" linkTo="/about">
            about us and our mission
          </TextLink>
          .
        </p>
      </div>
      <a styleName="attribution" href="https://clearbit.com" target="_">
        Logos provided by Clearbit
      </a>
    </SubpageLayout>
  );
}

export default SendersPage;

export const query = graphql`
  query($id: String!) {
    sendersJson(id: { eq: $id }) {
      name
      label
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

function getStats({ unsubscribes, seen }) {
  let percentage = 0;
  if (unsubscribes === 0) {
    percentage = 0;
  } else {
    percentage = ((unsubscribes / seen) * 100).toFixed(2);
  }
  return { percentage };
  // const percentile = ranks[rank];
  // const asArray = Object.keys(ranks);
  // const negativePercentile = ranks[asArray[asArray.indexOf(rank) + 1]];

  // return {
  //   percentage,
  //   percentile,
  //   negativePercentile
  // };
}

function getSenders(addresses, limit) {
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

  const last = <span styleName="email-address">{show.pop()}</span>;

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

function getSuggestions(label) {
  const filtered = _shuffle(suggestions.filter(s => s !== label));
  const show = [label, ...filtered.slice(0, 4)];
  return (
    <>
      {show.map(s => (
        <span key={s}>
          <span styleName="suggestion">{s}</span>,{' '}
        </span>
      ))}
      and many more
    </>
  );
}
