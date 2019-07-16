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

function LongTailKeywords({ data }) {
  const { longTailJson } = data;
  const { slug, title } = longTailJson;

  return (
    <SubpageLayout
      title={`Unsubscribe from ${name} with a single click`}
      description={''}
    >
      <div styleName="enterprise-inner">
        <div styleName="container intro-header">
          <div styleName="container-text">
            <h1 styleName="tagline">{title}</h1>
            <p styleName="description">
              Leave Me Alone lets you see all of your subscription emails in one
              place and unsubscribe from them with a single click.
            </p>

            <a href="/login" className={`beam-me-up-cta`}>
              Sign up for free
            </a>
          </div>
          <div styleName="container-image">
            <img src={allSubscriptions} alt="all unsubscriptions" />
          </div>
        </div>
      </div>
    </SubpageLayout>
  );
}

export default LongTailKeywords;

export const query = graphql`
  query($id: String!) {
    longTailJson(id: { eq: $id }) {
      title
      slug
    }
  }
`;
