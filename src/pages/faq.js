import React from 'react';
import SubPageLayout from '../layouts/subpage-layout';

import './faq.css';

const FaqPage = () => (
  <SubPageLayout page="FAQ" className="faq-page">
    <h1>FAQs</h1>
    <div className="faqs">
      <div className="faq-box">
        <h3 className="faq-title">
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
          them to trash or applying a label. This is better for both your inbox,
          and the subscription service as they'll now know they have one less
          subscriber!
        </p>
      </div>
      <div className="faq-box">
        <h3 className="faq-title">How do you unsubscribe from the lists?</h3>
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
      <div className="faq-box">
        <h3 className="faq-title">What mail providers do you support?</h3>
        <p>
          We currently only support Gmail but{' '}
          <a href="mailto:leavemalone@squarecat.io">let us know</a> what
          services you'd like us to integrate with and we'll add it to our{' '}
          <a
            className="link"
            target="_blank"
            rel="noopener noreferrer"
            href="/roadmap"
          >
            roadmap
          </a>
          .
        </p>
      </div>
      <div className="faq-box">
        <h3 className="faq-title">Which mailboxes do you scan?</h3>
        <p>
          We scan all of your mail including the trash. The only folder we
          exclude is the spam folder.
        </p>
      </div>
      <div className="faq-box">
        <h3 className="faq-title">Can I purchase a monthly subscription?</h3>
        <p>
          Not yet! Our pricing is tiered on how far back in time you want us to
          include in a scan.
        </p>
        <p>
          We’ll scan your inbox for any subscription emails received in the{' '}
          <span className="text-important">last 3 days for free</span>.
        </p>
        <p>
          To scan for email subscriptions received in the{' '}
          <span className="text-important">
            last week, last month, or last 6 months
          </span>
          , you can make a one-time purchase of one of our packages.
        </p>
        <p>
          We are considering adding monthly subscription plans to Leave Me
          Alone, if you'd be interested in this please{' '}
          <a href="mailto:leavemalone@squarecat.io">email</a> or{' '}
          <a href="https://twitter.com/leavemealoneapp">tweet</a> us.
        </p>
      </div>
      <div className="faq-box">
        <h3 className="faq-title">Can I re-subscribe to mailing lists?</h3>
        <p>
          Sorry, we can't subscribe you to a mailing list you have unsubscribed
          from. You'd need to visit the website and subscribe again manually.
        </p>
      </div>
    </div>
  </SubPageLayout>
);

export default FaqPage;
