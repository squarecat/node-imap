import React from 'react';

import { TextLink } from '../../text';

export const ProviderFooter = ({ name }) => (
  <div>
    <h2>
      Start unsubscribing from emails in your <span>{name}</span> inboxes today.
    </h2>
    <a
      href={`/signup?ref=provider-${name}`}
      className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert beam-me-up-fit-long-stuff-please`}
      style={{ margin: '50px auto' }}
    >
      Sign up with {name} now!
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
);
