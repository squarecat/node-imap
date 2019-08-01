import './providers.module.scss';

import {
  HeaderHighlight,
  TextImportant,
  TextLink
} from '../../components/text';

import { Arrow as ArrowIcon } from '../../components/icons';
import MailListIllustration from '../../components/landing/illustration';
import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import broom from '../../assets/enterprise/broom.png';
import envelope from '../../assets/open-envelope-love.png';
import happy from '../../assets/enterprise/happy.png';

const PROVIDER_NAME = 'IMAP';
// const VARIATIONS = ['Fastmail'];
// const META_VARIATIONS = 'Fastmail';
// const TRUSTBAR_LOGOS = [fastmailLogo];

const ProviderIMAP = () => {
  // const variationsText = getVariationsText(VARIATIONS);
  return (
    <SubPageLayout
      title={`Leave Me Alone for ${PROVIDER_NAME}`}
      description={`Easily unsubscribe from unwanted spam, subscription emails, and newsletters in all ${PROVIDER_NAME} inboxes today.`}
      withContent={false}
      slug="/provider/imap"
    >
      <div styleName="provider-inner">
        <div styleName="container">
          <div styleName="container-text">
            <h1 styleName="title">
              Leave Me Alone for{' '}
              <HeaderHighlight>{PROVIDER_NAME}</HeaderHighlight>
            </h1>
            <p styleName="tagline">
              Easily unsubscribe from unwanted spam, subscription emails, and
              newsletters in all IMAP inboxes today.
            </p>

            <a href="/signup" className={`beam-me-up-cta`}>
              Get Started for FREE
            </a>
          </div>
          <div styleName="container-image">
            <MailListIllustration />
          </div>
        </div>

        <div styleName="features">
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={happy} alt="happy face image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">One</h3>
              <p>Lorem...</p>
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
              <h3 styleName="feature-title">Two</h3>
              <p>Lorem...</p>
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
              <h3 styleName="feature-title">Three</h3>
              <p>Lorem...</p>
              <p>
                <TextLink as="link" linkTo="/security">
                  Learn how we power these stats{' '}
                  <ArrowIcon inline width="12" height="12" />
                </TextLink>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* <div styleName="trustbar">
        <div styleName="provider-inner trustbar-images">
          {TRUSTBAR_LOGOS.map((logo, i) => (
            <span key={`trustbar-logo-${i}`} styleName="trustbar-img">
              <img src={logo} />
            </span>
          ))}
        </div>
      </div> */}

      <div styleName="security">
        <div styleName="provider-inner">
          <div styleName="image-section">
            <div styleName="image-section-text">
              <h2>TODO</h2>
              <p>Lorem...</p>
              <p>Lorem...</p>
              <p>
                <TextLink inverted href="/security">
                  Read more about security at Leave Me Alone{' '}
                  <ArrowIcon inline width="14" height="14" />
                </TextLink>
              </p>
            </div>
            <div styleName="image-section-img bordered">
              {/* TODO screenshot of IMAP setup? */}
              {/* <img alt="Google permissions requested" src={googleScopes} /> */}
            </div>
          </div>
        </div>
      </div>

      <div styleName="provider-inner">
        <div styleName="end-stuff">
          <h2>Start unsubscribing from unwanted emails today</h2>
          <a
            href={`/signup?ref=provider-${name}`}
            className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert beam-me-up-fit-long-stuff-please`}
            style={{ margin: '50px auto' }}
          >
            Try now for FREE
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
      </div>
    </SubPageLayout>
  );
};

export default ProviderIMAP;

// function getVariationsText(list) {
//   const last = <TextImportant>{list.pop()}</TextImportant>;
//   return (
//     <>
//       {list.map(s => (
//         <>
//           <TextImportant>{s}</TextImportant>,{' '}
//         </>
//       ))}
//       and <TextImportant>{last}</TextImportant>
//     </>
//   );
// }
