import './providers.module.scss';

import { HeaderHighlight, TextLink } from '../../components/text';

import { Arrow as ArrowIcon } from '../../components/icons';
import MailListIllustration from '../../components/landing/illustration';
import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import aolLogo from '../../assets/providers/imap/aol-logo.png';
import broom from '../../assets/enterprise/broom.png';
import envelope from '../../assets/open-envelope-love.png';
import fastmailLogo from '../../assets/providers/imap/fastmail-logo.png';
import { getVariationsText } from '../../components/landing/providers';
import happy from '../../assets/enterprise/happy.png';
import icloudLogo from '../../assets/providers/imap/icloud-logo.png';
import securityImg from '../../assets/security.png';
import yahooLogo from '../../assets/providers/imap/yahoo-logo.png';

const VARIATIONS = [
  'Fastmail',
  'Yahoo! Mail',
  'iCloud',
  'AOL',
  'all other mailboxes'
];
const META_VARIATIONS = `Fastmail, Yahoo! Mail, iCloud, AOL, and all other mailboxes`;
const TRUSTBAR_LOGOS = [fastmailLogo, aolLogo, yahooLogo, icloudLogo];

const ProviderIMAP = () => {
  const variationsText = getVariationsText(VARIATIONS);
  return (
    <SubPageLayout
      title={`Leave Me Alone for all mailboxes`}
      description={`Easily unsubscribe from unwanted spam, subscription emails, and
      newsletters in ${META_VARIATIONS} today.`}
      withContent={false}
      slug="/providers/imap"
    >
      <div styleName="provider-inner">
        <div styleName="container">
          <div styleName="container-text">
            <h1 styleName="title">
              Leave Me Alone for{' '}
              <HeaderHighlight>All Mailboxes</HeaderHighlight>
            </h1>
            <p styleName="tagline">
              Easily unsubscribe from unwanted spam, subscription emails, and
              newsletters in {variationsText}.
            </p>

            <a href="/signup" className={`beam-me-up-cta`}>
              Start Unsubscribing
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
              <h3 styleName="feature-title">
                Inbox sanity for all mailboxes, everywhere
              </h3>
              <p>
                The Internet Message Access Protocol (IMAP) is a mail protocol
                used for accessing email on a remote web server from a local
                client. This is usually supported by all modern email clients
                and web servers.
              </p>
              <p>
                <TextLink as="link" linkTo="/learn">
                  Learn how Leave Me Alone works{' '}
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
                Clean all of your mailboxes, together
              </h3>
              <p>
                Connect all of your email accounts and scan them together. Leave
                Me Alone supports multiple IMAP, Google, and Microsoft accounts.
                Clear out all of your subscription emails from all of your email
                addresses in one go.
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
                Your information protected, always
              </h3>
              <p>
                We're committed to privacy. We never store the content of your
                emails, your IMAP credentials are encrypted using password
                manager level security, and you can deactivate your account,
                which removes all of your data, at any time.
              </p>
              <p>
                <TextLink as="link" linkTo="/security">
                  Read about Leave Me Alone security{' '}
                  <ArrowIcon inline width="12" height="12" />
                </TextLink>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div styleName="trustbar imap">
        <div styleName="provider-inner trustbar-images">
          {TRUSTBAR_LOGOS.map((logo, i) => (
            <span key={`trustbar-logo-${i}`} styleName="trustbar-img">
              <img src={logo} alt="IMAP provider logo" />
            </span>
          ))}
        </div>
      </div>

      <div styleName="security">
        <div styleName="provider-inner">
          <div styleName="image-section">
            <div styleName="image-section-text">
              <h2>Peace of mind for data security and privacy</h2>
              <p>
                Leave Me Alone protects your IMAP credentials in the same way as
                secure password managers.
              </p>
              <p>
                Your authentication details are encrypted by your personal
                master password, and can only be decrypted when you log in and
                fetch your mail.
              </p>
              <p>
                We NEVER store the content of any emails. Emails we scan on your
                behalf are streamed directly to you, and not stored on our
                system.
              </p>
              <p>
                At any time you can deactivate your account which will delete
                all of your data, revoke your API keys, and sign you out.
              </p>
              <p>
                <TextLink inverted href="/security">
                  Read more about security at Leave Me Alone{' '}
                  <ArrowIcon inline width="14" height="14" />
                </TextLink>
              </p>
            </div>
            <div styleName="image-section-img">
              <img src={securityImg} alt="list of our security features" />
            </div>
          </div>
        </div>
      </div>

      <div styleName="provider-inner">
        <div styleName="end-stuff">
          <h2>Start unsubscribing from emails in {variationsText} today!</h2>
          <a
            href={`/signup?ref=provider-imap`}
            className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert beam-me-up-fit-long-stuff-please`}
            style={{ margin: '50px auto' }}
          >
            Sign up for Free
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
