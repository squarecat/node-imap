import './providers.module.scss';

import {
  GoogleIcon,
  MicrosoftIcon,
  Arrow as ArrowIcon
} from '../components/icons';
import { IMAP_PROVIDERS, OAUTH_PROVIDERS } from '.';
import { TextLink } from '../components/text';

import MailListIllustration from '../components/landing/illustration';
import React from 'react';
import SubPageLayout from '../layouts/subpage-layout';
import aolImg from '../assets/providers/imap/aol-logo.png';
import fastmailImg from '../assets/providers/imap/fastmail-logo.png';
import icloudImg from '../assets/providers/imap/icloud-logo.png';
import yahooImg from '../assets/providers/imap/yahoo-logo.png';

const ProviderGoogle = () => {
  return (
    <SubPageLayout
      title={`Unsubscribe from emails in Gmail, G Suite, Outlook, Hotmail, iCloud, Fastmail and more`}
      description={`Leave Me Alone cleans up your Gmail, G Suite, Outlook, and Hotmail. Plus, Yahoo, iCloud, Fastmail, AOL all mailboxes that work with IMAP. Try free today!`}
      withContent={false}
      slug="/supported-email-providers"
    >
      <div styleName="provider-inner hero">
        <div styleName="container">
          <div styleName="container-text">
            <h1 styleName="title">
              Easily unsubscribe from unwanted emails in all your mailboxes
            </h1>
            <p styleName="tagline">
              Leave Me Alone shows the subscription emails in your Gmail, G
              Suite, Outlook, Hotmail, iCloud, Fastmail and more.
            </p>

            <a
              href="/signup"
              event="clicked-google-cta"
              className={`beam-me-up-cta`}
            >
              Connect Your Inbox!
            </a>
          </div>
          <div styleName="container-image">
            <MailListIllustration />
          </div>
        </div>
      </div>

      <div styleName="provider-inner supports">
        <h2>We support all Google and Microsoft accounts</h2>
        <p>
          You can connect all Google or Microsoft email addresses to Leave Me
          Alone. This includes <strong>{OAUTH_PROVIDERS}</strong>
        </p>
        <div styleName="provider-logos">
          <TextLink undecorated as="link" linkTo="/unsubscribe-gmail-g-suite">
            <span styleName="provider-logo">
              <GoogleIcon width="60" height="60" />
            </span>
          </TextLink>
          <TextLink undecorated as="link" linkTo="/unsubscribe-outlook-hotmail">
            <span styleName="provider-logo">
              <MicrosoftIcon width="60" height="60" />
            </span>
          </TextLink>
          <p styleName="provider-link">
            <TextLink href="/unsubscribe-gmail-g-suite">
              Leave Me Alone for Google Accounts{' '}
              <ArrowIcon inline width="12" height="12" />
            </TextLink>
          </p>
          <p>
            <TextLink href="/unsubscribe-outlook-hotmail">
              Leave Me Alone for Microsoft Accounts{' '}
              <ArrowIcon inline width="12" height="12" />
            </TextLink>
          </p>
        </div>
        <span styleName="separator" />
        <p>
          You can also connect all of your accounts with{' '}
          <strong>{IMAP_PROVIDERS}</strong> that work with IMAP.
        </p>
        <TextLink
          undecorated
          as="link"
          linkTo="/unsubscribe-imap-fastmail-icloud"
        >
          <div styleName="provider-logos">
            <span styleName="provider-logo imap" title="Fastmail">
              <img src={fastmailImg} alt="Fastmail logo" />
            </span>
            <span styleName="provider-logo imap" title="AOL">
              <img src={aolImg} alt="AOL logo" />
            </span>
            <span styleName="provider-logo imap" title="iCloud">
              <img src={icloudImg} alt="iCloud logo" />
            </span>
            <span styleName="provider-logo imap" title="Yahoo Mail">
              <img src={yahooImg} alt="Yahoo Mail logo" />
            </span>
          </div>
          <p styleName="provider-link">
            <TextLink href="/unsubscribe-imap-fastmail-icloud">
              Leave Me Alone for IMAP Accounts{' '}
              <ArrowIcon inline width="12" height="12" />
            </TextLink>
          </p>
        </TextLink>
      </div>

      <div styleName="provider-inner end-stuff">
        <h2>Unsubscribe from annoying emails in all of your inboxes!</h2>
        <a
          href="/signup"
          className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert`}
          style={{ margin: '50px auto' }}
        >
          Start Unsubscribing
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
};

export default ProviderGoogle;
