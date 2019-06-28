import './faq.module.scss';

import { TextImportant, TextLink } from '../../components/text';

import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';

const FaqPage = () => (
  <SubPageLayout
    title="FAQ"
    description="Answers to the most common questions about Leave Me Alone"
  >
    <h1>FAQs</h1>
    <div styleName="faqs">
      <div styleName="faq-box">
        <h3 styleName="faq-title">
          How is Leave Me Alone different from other services like Unroll.me?
        </h3>
        <p>
          When we scan your inbox we NEVER sell any of your data for marketing
          (it's been reported that Unroll.me do this, you can read about it in{' '}
          <a href="https://www.nytimes.com/2017/04/24/technology/personal-data-firm-slice-unroll-me-backlash-uber.html">
            The New York Times
          </a>
          ).
        </p>
        <p>
          We actually unsubscribe you from the lists rather than just moving
          them to trash or applying a label. Those subscriptions are gone
          forever, even if you decide to stop using our service.
        </p>
      </div>
      <div styleName="faq-box">
        <h3 styleName="faq-title">
          How can you tell which emails are subscriptions?
        </h3>
        <p>
          We never read the content of any of your emails but we do have access
          to some metadata - information about an email which you don’t usually
          see.
        </p>
        <p>
          This metadata contains information on how to unsubscribe from the
          mailing list which we can use.
        </p>
      </div>
      <div styleName="faq-box">
        <h3 styleName="faq-title">How do you unsubscribe me from emails?</h3>
        <p>
          If there's an unsubscribe link provided we follow it and unsubscribe
          you.
        </p>
        <p>
          If the sender didn't provide a link then we send an email on your
          behalf using a unique address which identifies your subscription.
        </p>
        <p>
          If the provider{' '}
          <a href="https://tools.ietf.org/html/rfc8058">obeys the rules</a> then
          this should work, and you'll now be unsubscribed.
        </p>
      </div>
      <div styleName="faq-box">
        <h3 styleName="faq-title">Why is Leave Me Alone not free?</h3>
        <p>
          Leave Me Alone is a paid service (so that you know we don't need to
          sell your data to keep afloat), but we've tried to keep our pricing as
          fair and affordable as possible.
        </p>
        <p>
          We are two independent makers without funding or outside support.
          We're real people who want to help, not a soulless corporation.
        </p>
      </div>
      <div styleName="faq-box">
        <h3 styleName="faq-title">What mail providers do you support?</h3>
        <p>
          We currently support Gmail and Outlook. We have plans to support more
          providers. <a href="mailto:hello@leavemalone">Let us know</a> which
          services you'd like us to integrate with and we'll add it to our{' '}
          <TextLink target="_blank" rel="noopener noreferrer" href="/roadmap">
            roadmap
          </TextLink>
          .
        </p>
      </div>
      <div styleName="faq-box">
        <h3 styleName="faq-title">Which mail folders do you scan?</h3>
        <p>We scan all of your mail including the trash and spam!</p>
        <p>
          We'll let you know if an email was seen in your trash or spam folder.
        </p>
      </div>

      <div styleName="faq-box">
        <h3 styleName="faq-title">What information can you access about me?</h3>
        <p>We NEVER store the content of your emails in any form.</p>
        <p>
          We require permission to{' '}
          <TextImportant>view your email messages and settings</TextImportant>{' '}
          so we can identify subscription emails and display them to you.
        </p>
      </div>
      <div styleName="faq-box">
        <h3 styleName="faq-title">Can I delete my account?</h3>
        <p>Yes!</p>
        <p>
          You can deactivate your account in your{' '}
          <TextLink as="link" linkTo="/app/profile">
            account settings
          </TextLink>
          . This will delete all of your data, revoke your API keys, and sign
          you out.
        </p>
        <p>
          You will still be able to create an account again to clean your inbox
          in the future.
        </p>
      </div>

      <div styleName="faq-box">
        <h3 styleName="faq-title">Do you have a monthly plan?</h3>
        <p>
          We offer a{' '}
          <TextLink as="link" linkTo="/enterprise">
            monthly subscription for enterprise customers
          </TextLink>{' '}
          which are billed per seat so that your entire office can clean their
          inboxes.
        </p>
      </div>
      <div styleName="faq-box">
        <h3 styleName="faq-title">Can I re-subscribe to mailing lists?</h3>
        <p>
          Sorry, we can't subscribe you to a mailing list you have unsubscribed
          from. You'd need to visit the website and subscribe again manually.
        </p>
      </div>
      <a href="/signup" styleName="cta">
        Get Started For Free!
      </a>
    </div>
  </SubPageLayout>
);

export default FaqPage;
