import './provider.module.scss';

import { TextImportant, TextLink } from '../../components/text';

import { Arrow as ArrowIcon } from '../../components/icons';
import MailListIllustration from '../../components/landing/illustration';
import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import Testimonial from '../../components/landing/testimonial';
import broom from '../../assets/enterprise/broom.png';
import envelope from '../../assets/open-envelope-love.png';
import happy from '../../assets/enterprise/happy.png';
// import luke from '../../assets/luke.jpeg';
import officeLogo from '../../assets/providers/office-365-logo.png';
import microsoftLogo from '../../assets/providers/microsoft-logo.png';
import hotmailLogo from '../../assets/providers/hotmail-logo.png';
import outlookLogo from '../../assets/providers/outlook-logo.png';
import msnLogo from '../../assets/providers/msn-logo.png';
import outlookScopesImg from '../../assets/security-outlook-scopes.png';

import { ProviderFooter } from '../../components/landing/providers';

const PROVIDER_NAME = 'Microsoft';

const TRUSTBAR_LOGOS = [
  microsoftLogo,
  hotmailLogo,
  outlookLogo,
  officeLogo,
  msnLogo
];

const ProviderMicrosoft = () => {
  return (
    <SubPageLayout
      title={`Leave Me Alone for ${PROVIDER_NAME}`}
      description={`Start cleaning up your ${PROVIDER_NAME} inboxes from unwanted spam, subscription emails, and newsletters today.`}
      withContent={false}
      slug="/provider/microsoft"
    >
      <div styleName="provider-inner hero">
        <div styleName="container">
          <div styleName="container-text">
            <h1 styleName="title">Leave Me Alone for {PROVIDER_NAME}</h1>
            <p styleName="tagline">
              Take back control of your Hotmail, Outlook, Office 365, and Live
              email accounts!
            </p>

            <a href="/signup" className={`beam-me-up-cta`}>
              Get Started for FREE
            </a>
          </div>
          <div styleName="container-image">
            <MailListIllustration />
          </div>
        </div>

        {/* <div styleName="features">
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={happy} alt="happy face image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">Inbox sanity for happy teams</h3>
              <p>
                Receiving unwanted subscription emails is a source of annoyance,
                frustration and interruption. Leave Me Alone makes it quick and
                easy to unsubscribe so that your team can focus on building your
                business.
              </p>
            </div>
          </div>
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={broom} alt="broom sweeping image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">Clean all accounts together</h3>
              <p>
                Email is necessary for company communication. Each team member
                can connect all of their email accounts and see all of their
                subscription emails in one go. Make email a productive tool
                again.
              </p>
            </div>
          </div>
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={envelope} alt="private envelope image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">Stay focused and productive</h3>
              <p>
                When you unsubscribe we don't just move your mail into a folder
                or to trash, instead we actually unsubscribe you from the list.
                Your company will be clear of subscriptions forever, even if you
                decide to stop using our service.
              </p>
            </div>
          </div>
        </div>
      </div> */}
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
                Leave Me Alone never stores the content of any emails. Emails we
                scan on your behalf are streamed directly to you, and not stored
                on our system.
              </p>
              <p>
                You can view your Microsoft App permissions or revoke access to
                Leave Me Alone at any time.
              </p>
              <p>
                <TextLink inverted href="/security">
                  Read more about security at Leave Me Alone{' '}
                  <ArrowIcon inline width="14" height="14" />
                </TextLink>
              </p>
            </div>
            <div styleName="image-section-img bordered">
              <img
                alt="Microsoft permissions requested"
                src={outlookScopesImg}
              />
            </div>
          </div>
        </div>
      </div>

      <div styleName="provider-inner">
        <div styleName="end-stuff">
          <ProviderFooter name={PROVIDER_NAME} />
        </div>
      </div>
    </SubPageLayout>
  );
};

export default ProviderMicrosoft;
