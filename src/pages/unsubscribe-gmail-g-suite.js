import './providers.module.scss';

import { HeaderHighlight, TextLink } from '../components/text';
import {
  ProviderFooter,
  getVariationsText
} from '../components/landing/providers';

import { Arrow as ArrowIcon } from '../components/icons';
import MailListIllustration from '../components/landing/illustration';
import ProvidersBar from '../components/landing/providers-bar';
import React from 'react';
import SubPageLayout from '../layouts/subpage-layout';
import gmailLogo from '../assets/providers/google/gmail-logo.png';
import googleLogo from '../assets/providers/google/google-logo.png';
import googleScopes from '../assets/security/security-gmail-scopes.png';
import gsuiteLogo from '../assets/providers/google/gsuite-logo.png';

const PROVIDER_NAME = 'Google';
const VARIATIONS = ['Gmail', 'Googlemail', 'G Suite'];
const META_VARIATIONS = `Gmail, Googlemail, and G Suite`;

const TRUSTBAR_LOGOS = [
  { name: 'Gmail', img: gmailLogo },
  { name: 'Google', img: googleLogo },
  { name: 'G Suite', img: gsuiteLogo }
];

const ProviderGoogle = () => {
  const variationsText = getVariationsText(VARIATIONS);
  return (
    <SubPageLayout
      title={`Leave Me Alone for ${PROVIDER_NAME}`}
      description={`Easily unsubscribe from unwanted spam, subscription emails, and newsletters in your ${PROVIDER_NAME}, ${META_VARIATIONS} inboxes today.`}
      withContent={false}
      slug="/unsubscribe-gmail-g-suite"
    >
      <div styleName="provider-inner hero">
        <div styleName="container">
          <div styleName="container-text">
            <h1 styleName="title">
              Leave Me Alone for{' '}
              <HeaderHighlight>{PROVIDER_NAME}</HeaderHighlight>
            </h1>
            <p styleName="tagline">
              Easily unsubscribe from unwanted spam, subscription emails, and
              newsletters in your {variationsText} inboxes.
            </p>

            <a
              href="/signup"
              event="clicked-google-cta"
              className={`beam-me-up-cta`}
            >
              Start Unsubscribing
            </a>
          </div>
          <div styleName="container-image">
            <MailListIllustration />
          </div>
        </div>
      </div>

      <ProvidersBar logos={TRUSTBAR_LOGOS} dark spaced />

      <div styleName="security">
        <div styleName="provider-inner">
          <div styleName="image-section">
            <div styleName="image-section-text">
              <h2>We only ask for the permissions we need</h2>
              <p>
                {PROVIDER_NAME} authorizes Leave Me Alone using OAuth. This
                allows us to access your emails without you giving us your
                password.
              </p>
              <p>
                Leave Me Alone never stores the content of any emails. Emails we
                scan on your behalf are streamed directly to you, and not stored
                on our system.
              </p>
              <p>
                You can view your {PROVIDER_NAME} App permissions or revoke
                access to Leave Me Alone at any time.
              </p>
              <p>
                <TextLink inverted href="/security">
                  Learn more about security and permissions{' '}
                  <ArrowIcon inline width="14" height="14" />
                </TextLink>
              </p>
            </div>
            <div styleName="image-section-img bordered">
              <img
                alt="Google OAuth permissions requested"
                src={googleScopes}
              />
            </div>
          </div>
        </div>
      </div>

      <div styleName="provider-inner end-stuff">
        <ProviderFooter name={PROVIDER_NAME} variations={variationsText} />
      </div>
    </SubPageLayout>
  );
};

export default ProviderGoogle;
