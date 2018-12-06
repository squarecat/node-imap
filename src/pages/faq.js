import React from 'react';
import SubPageLayout from '../layouts/subpage-layout';

import './faq.css';

const FaqPage = () => (
  <SubPageLayout className="faq-page">
    <h1>FAQ</h1>
    <div className="faqs">
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
        </p>
      </div>
      <div className="faq-box">
        <h3 className="faq-title">
          How is Leave Me Alone different from Unroll.me?
        </h3>
        <p>
          1. When we scan your inbox we NEVER sell any of your data for
          marketing (it's been reported that Unroll.me do this, you can read
          about it in{' '}
          <a href="https://www.nytimes.com/2017/04/24/technology/personal-data-firm-slice-unroll-me-backlash-uber.html">
            The New York Times
          </a>
          )
        </p>
        <p>
          2. We unsubscribe you from the lists rather than just moving them to
          trash or labelling them
        </p>
      </div>
      <div className="faq-box">
        <h3 className="faq-title">How do you unsubscribe from the lists?</h3>
        <p>
          We show you a list of your emails which are able to be unsubscribed
          from (they must contain the "List-Unsubscribe" header which gives us
          the information we require to be able to remove you)
        </p>
      </div>
      <div className="faq-box">
        <h3 className="faq-title">
          How do you handle unsubscribe confirmation steps?
        </h3>
        <p>
          Emails which are able to be unsubscribed from should to provide the
          "List-Unsubscribe" header in the email meta data.
        </p>
        <p>
          <a href="https://tools.ietf.org/html/rfc8058">RFC</a>
        </p>
      </div>
      <div className="faq-box">
        <h3 className="faq-title">How do you unsubscribe from the lists?</h3>
        <p>
          Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem
          ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
          Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
        </p>
      </div>
      <div className="faq-box">
        <h3 className="faq-title">How do you unsubscribe from the lists?</h3>
        <p>
          Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem
          ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
          Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
        </p>
      </div>
      <div className="faq-box">
        <h3 className="faq-title">How do you unsubscribe from the lists?</h3>
        <p>
          Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem
          ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
          Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
        </p>
      </div>
    </div>
  </SubPageLayout>
);

export default FaqPage;
