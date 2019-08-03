import './providers.module.scss';

import { HeaderHighlight, TextLink } from '../../components/text';
import {
  ProviderFooter,
  getVariationsText
} from '../../components/landing/providers';

import { Arrow as ArrowIcon } from '../../components/icons';
import MailListIllustration from '../../components/landing/illustration';
import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import hotmailLogo from '../../assets/providers/hotmail-logo.png';
import microsoftLogo from '../../assets/providers/microsoft-logo.png';
import msnLogo from '../../assets/providers/msn-logo.png';
import officeLogo from '../../assets/providers/office-365-logo.png';
import outlookLogo from '../../assets/providers/outlook-logo.png';
import outlookScopesImg from '../../assets/security-outlook-scopes.png';

const PROVIDER_NAME = 'Microsoft';
const VARIATIONS = ['Hotmail', 'Outlook', 'Office 365', 'Live', 'MSN'];
const META_VARIATIONS = `Hotmail, Outlook, Office 365, Live, and MSN`;

const TRUSTBAR_LOGOS = [
  microsoftLogo,
  hotmailLogo,
  outlookLogo,
  officeLogo,
  msnLogo
];

const ProviderMicrosoft = () => {
  const variationsText = getVariationsText(VARIATIONS);
  return (
    <SubPageLayout
      title={`Leave Me Alone for ${PROVIDER_NAME}`}
      description={`Easily unsubscribe from unwanted spam, subscription emails, and newsletters in your ${PROVIDER_NAME}, ${META_VARIATIONS} inboxes today.`}
      withContent={false}
      slug="/providers/microsoft"
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

            <a href="/signup" className={`beam-me-up-cta`}>
              Start Unsubscribing
            </a>
          </div>
          <div styleName="container-image">
            <MailListIllustration />
          </div>
        </div>
      </div>

      <div styleName="trustbar">
        <div styleName="provider-inner trustbar-images">
          {TRUSTBAR_LOGOS.map((logo, i) => (
            <span key={`trustbar-logo-${i}`} styleName="trustbar-img">
              <img src={logo} />
            </span>
          ))}
        </div>
      </div>

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
                alt="Microsoft OAuth permissions requested"
                src={outlookScopesImg}
              />
            </div>
          </div>
        </div>
      </div>

      <div styleName="provider-inner">
        <div styleName="end-stuff">
          <ProviderFooter name={PROVIDER_NAME} variations={variationsText} />
        </div>
      </div>
    </SubPageLayout>
  );
};

export default ProviderMicrosoft;
