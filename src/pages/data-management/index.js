import './data-management.module.scss';

import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import { TextImportant } from '../../components/text';

export default function DataManagementPage() {
  return (
    <SubPageLayout
      title="Data Management"
      description="Read about the completely annoymous data we store and how we use it for our statistics and algorithms."
    >
      <h1>Our data</h1>
      <p>We never store the content of your emails in any form.</p>
      <p>
        We do store some <TextImportant>completely anonymous</TextImportant>{' '}
        data which falls into categories:
      </p>

      <ul styleName="list">
        <li>
          <span style={{ textDecoration: 'underline' }}>Statistical data</span>{' '}
          which you see on our homepage and open page . This consists of 'counts
          of events' such as number of users, number of emails we have seen,
          number of emails unsubscribed from, total revenue etc.
        </li>
        <li>
          <span style={{ textDecoration: 'underline' }}>Algorithmic data</span>{' '}
          which powers features like Subscriber Score . This consists of
          'metadata about senders' such as email frequencies and unsubscribe
          rates. Read more below.
        </li>
      </ul>

      <h2 styleName="sub-head">Subscriber Score</h2>
      <p>
        The metadata powering Subscriber Score is sender based. A sender is who
        an email has come from, such as LinkedIn.
      </p>
      <p>
        So that we can provide you with a ranking for each sender we record:
      </p>
      <ul styleName="list">
        <li>How often a sender is seen</li>
        <li>How often a sender is unsubscribed from</li>
      </ul>
      <p>
        We only store counts about how often LinkedIn is seen and unsubscribed
        from, never any user data.
      </p>
      <br />
      <p>
        A senders ranking is calculated using some secret sauce mathematics,
        which grades each sender based on the stats above.
      </p>

      <h2 styleName="sub-head">Security</h2>
      <p>
        All sensitive information such as API keys and passwords are encrypted.
      </p>
      <p>
        Our servers are secured using industry standard methods and all requests
        are sent using HTTPS.
      </p>
      <div styleName="stuff-at-the-bottom">
        <h2>Want to know more?</h2>
        <p>
          We are proud to be open and transparent about our service in every way
          we can.
        </p>
        <p>
          If you have any more questions about how we operate then{' '}
          <a href="mailto:hello@leavemealone.app">send us a message</a> - we
          will be happy to help!
        </p>
      </div>
    </SubPageLayout>
  );
}
