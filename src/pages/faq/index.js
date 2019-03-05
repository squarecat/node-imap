import './faq.module.scss';

import { TextImportant, TextLink } from '../../components/text';

import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';

const FaqPage = () => (
  <SubPageLayout page="FAQ">
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
        <h3 styleName="faq-title">How do you unsubscribe from the lists?</h3>
        <p>
          If there's an unsubscribe link provided we follow it and unsubscribe
          you.
        </p>
        <p>
          If the sender didn't provide a link then we send an email on your
          behalf using the a unique address which identifies your subscription.
        </p>
        <p>
          If the provider{' '}
          <a href="https://tools.ietf.org/html/rfc8058">obeys the rules</a> then
          this should work, and you'll now be unsubscribed.
        </p>
      </div>
      <div styleName="faq-box">
        <h3 styleName="faq-title">What mail providers do you support?</h3>
        <p>
          We currently support Gmail and Outlook. We have plans to support more
          providers. <a href="mailto:leavemalone@squarecat.io">Let us know</a>{' '}
          which services you'd like us to integrate with and we'll add it to our{' '}
          <TextLink target="_blank" rel="noopener noreferrer" href="/roadmap">
            roadmap
          </TextLink>
          .
        </p>
      </div>
      <div styleName="faq-box">
        <h3 styleName="faq-title">Which mailboxes do you scan?</h3>
        <p>
          We scan all of your mail including the trash. The only folder we
          exclude is the spam folder.
        </p>
      </div>
      <div styleName="faq-box">
        <h3 styleName="faq-title">Can I purchase a monthly subscription?</h3>
        <p>
          Not yet! Our pricing is tiered on how far back in time you want us to
          include in a scan.
        </p>
        <p>
          We’ll scan your inbox for any subscription emails received in the{' '}
          <TextImportant>last 3 days for free</TextImportant>.
        </p>
        <p>
          To scan for email subscriptions received in the{' '}
          <TextImportant>last week, last month, or last 6 months</TextImportant>
          , you can make a one-time purchase of one of our packages.
        </p>
        <p>
          We are considering adding monthly subscription plans to Leave Me
          Alone, if you'd be interested in this please{' '}
          <a href="mailto:leavemalone@squarecat.io">email</a> or{' '}
          <a href="https://twitter.com/leavemealoneapp">tweet</a> us.
        </p>
      </div>
      <div styleName="faq-box">
        <h3 styleName="faq-title">Can I re-subscribe to mailing lists?</h3>
        <p>
          Sorry, we can't subscribe you to a mailing list you have unsubscribed
          from. You'd need to visit the website and subscribe again manually.
        </p>
      </div>
    </div>
  </SubPageLayout>
);

export default FaqPage;
