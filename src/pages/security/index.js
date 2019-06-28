import './security.module.scss';

import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import { TextImportant } from '../../components/text';
import lockImg from '../../assets/lock.png';
import securityImg from '../../assets/security.png';
import subscriberScoreImg from '../../assets/subscriber-score.png';

export default function SecurityPage() {
  return (
    <SubPageLayout
      title="Security"
      description="We take security and data privacy very seriously at Leave Me Alone. We never store the content of your emails, we encrypt sensitive data, and the data powering our algorithms is completely anonymous."
      withContent={false}
    >
      <div styleName="security-inner">
        <h1>Security at Leave Me Alone</h1>

        <p styleName="tagline">
          We take security and data privacy very seriously at Leave Me Alone,
          and we are proud to be open and transparent about how we operate.
        </p>

        <div styleName="image-section image-right">
          <div styleName="image-section-text">
            <h2>What data do we store?</h2>
            <p>We never store the content of your emails in any form.</p>
            <p>
              We do store some{' '}
              <TextImportant>completely anonymous</TextImportant> data which
              falls into two categories:
            </p>

            <ul styleName="list">
              <li>
                <span style={{ textDecoration: 'underline' }}>
                  Statistical data
                </span>{' '}
                which you see on our homepage and open page. This consists of
                counts of events such as number of users, number of emails we
                have seen, number of emails unsubscribed from, total revenue
                etc.
              </li>
              <li>
                <span style={{ textDecoration: 'underline' }}>
                  Algorithmic data
                </span>{' '}
                which powers features like Subscriber Score. This consists of
                metadata about senders such as email frequencies and unsubscribe
                rates.
              </li>
            </ul>
          </div>
          <div styleName="image-section-img">
            <img alt="lock image in a cloud" src={lockImg} />
          </div>
        </div>

        <div styleName="image-section image-left">
          <div styleName="image-section-img">
            <img
              src={subscriberScoreImg}
              alt="subscriber score for a subscription email showing a rating of C"
            />
          </div>
          <div styleName="image-section-text">
            <h2>Subscriber Score</h2>
            <p>
              The metadata powering Subscriber Score is sender based. A sender
              is who an email has come from.
            </p>
            <p>
              So that we can provide you with a ranking for each sender we
              record:
            </p>
            <ul styleName="list">
              <li>How often a sender is seen</li>
              <li>How often a sender is unsubscribed from</li>
            </ul>
            <p>
              A senders ranking is calculated using some secret sauce
              mathematics, which grades each sender based on the stats above.
            </p>
            <br />
            <p>
              We only store specific counts such as how frequently a sender is
              seen, how often an email is in spam or trash, and how many people
              choose to unsubscribe.
            </p>
            <p>
              As it is anoymous, it is not possible for this data to be
              associated with a Leave Me Alone account or email address.
            </p>
          </div>
        </div>
      </div>

      <div styleName="security-features">
        <div styleName="security-inner">
          <div styleName="image-section">
            <div styleName="image-section-text">
              <h2>Security features</h2>
              <p>
                We are 100% committed to protecting you and your information.
              </p>
              <p>
                At any time you can deactivate your account which will delete
                all of your data, revoke your API keys, and sign you out.
              </p>
            </div>
            <div styleName="image-section-img">
              <img src={securityImg} alt="list of our security features" />
            </div>
          </div>
        </div>
      </div>

      <div styleName="security-inner">
        <div styleName="stuff-at-the-bottom">
          <h2>Want to know more?</h2>
          <p>
            We are proud to be open and transparent about our service in every
            way we can.
          </p>
          <p>
            If you have any more questions about how we operate then please{' '}
            <a href="mailto:hello@leavemealone.app">get in touch</a> - we will
            be happy to help!
          </p>
          <a
            href="mailto:security@leavemealone.app"
            className={`beam-me-up-cta beam-me-up-cta-center`}
            style={{ marginTop: 50 }}
          >
            Contact Us
          </a>
        </div>
      </div>
    </SubPageLayout>
  );
}
