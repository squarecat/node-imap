import React from 'react';
import SubPageLayout from '../layouts/subpage-layout';

import './faq.css';

const FaqPage = () => (
  <SubPageLayout className="faq-page">
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
          We unsubscribe you from the lists rather than just moving them to
          trash or applying a label.
        </p>
      </div>
      <div className="faq-box">
        <h3 className="faq-title">How do you unsubscribe from the lists?</h3>
        <p>If there's an unsubscribe link provided we click it.</p>
        <p>
          If the sender didn't provide a link then we send an email on your
          behalf using the a unique address which identifies your subscription.
        </p>
        <p>
          If the provider obeys the{' '}
          <a href="https://tools.ietf.org/html/rfc8058">RFC</a> then this will
          work.
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
            href="https://www.notion.so/33d2efb925634020a1cd64d40b91efe4"
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
        <h3 className="faq-title">Do you have a subscription service?</h3>
        <p>
          Not yet! If you'd like a monthly subscription to Leave Me Alone{' '}
          <a href="mailto:leavemalone@squarecat.io">email</a> or{' '}
          <a href="https://twitter.com/leavemealoneapp">tweet</a> us.
        </p>
      </div>
    </div>
  </SubPageLayout>
);

export default FaqPage;
