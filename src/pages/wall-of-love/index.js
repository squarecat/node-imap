import './wall-of-love.module.scss';

import SubPageLayout, { SubpageTagline } from '../../layouts/subpage-layout';

import ProductHuntBadges from '../../components/landing/ph-badges';
import React from 'react';
import { TextLink } from '../../components/text';
import WallOfLove from '../../components/landing/wall-of-love';

export default function WallOfLovePage() {
  return (
    <SubPageLayout
      title="Wall of Love"
      description={`Our customers love Leave Me Alone. Here are some of the lovely things they've said about us!`}
      slug="/wall-of-love"
    >
      <h1>Wall of Love</h1>
      <SubpageTagline>
        Our customers love Leave Me Alone. Here are some of the lovely things
        they've said about us!
      </SubpageTagline>
      <ProductHuntBadges />
      <WallOfLove />
      <div styleName="end-stuff">
        <h2>Check out what all the fuss is about!</h2>
        <a
          event="clicked-wall-of-love-cta"
          href={`/signup`}
          className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert`}
          style={{ margin: '50px auto' }}
        >
          Sign up for FREE
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
    </SubPageLayout>
  );
}
