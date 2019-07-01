import './security.module.scss';

import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import { TextImportant, TextLink } from '../../components/text';
import lockImg from '../../assets/lock.png';
import securityImg from '../../assets/security.png';
import subscriberScoreImg from '../../assets/subscriber-score.png';
import gmailScopesImg from '../../assets/security-gmail-scopes.png';
import outlookScopesImg from '../../assets/security-outlook-scopes.png';

const scopesUrlForGoogle =
  'https://developers.google.com/gmail/api/auth/scopes';
const scopesUrlForOutlook =
  'https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#scopes-and-permissions';

const revokeUrlForGoogle =
  'https://security.google.com/settings/security/permissions';
const revokeUrlForOutlook = 'https://account.live.com/consent/Manage';

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

        <div styleName="permissions">
          <h2>What permissions do we ask for?</h2>
          <p>We only ask for the permissions we need to operate.</p>
          <div styleName="image-section scopes">
            <div styleName="image-section-text">
              <h3>Google</h3>
              <ul styleName="list">
                <li>
                  <TextImportant>gmail.readonly</TextImportant> - View your
                  email messages and settings. We use this to identify
                  subscription emails and display them to you.
                </li>
                <li>
                  <TextImportant>profile</TextImportant> - View your basic
                  profile info. We use this to show your name and display
                  picture when you log in with Google.
                </li>
                <li>
                  <TextImportant>email</TextImportant> - View your email
                  address. We use this to identify your account and to display
                  which account you are logged in with or have connected.
                </li>
              </ul>

              <p>
                Read more about the{' '}
                <TextLink href={scopesUrlForGoogle}>Gmail</TextLink> OAuth
                scopes.
              </p>
              <p>
                You can view your Google App permissions or revoke access to
                Leave Me Alone at any time{' '}
                <TextLink href={revokeUrlForGoogle}>here</TextLink>.
              </p>
            </div>
            <div styleName="image-section-img bordered">
              <img alt="Gmail permissions requested" src={gmailScopesImg} />
            </div>
          </div>

          <div styleName="image-section scopes">
            <div styleName="image-section-text">
              <h3>Microsoft</h3>
              <ul styleName="list">
                <li>
                  <TextImportant>Mail.Read</TextImportant> - Read your emails.
                  We use this to identify subscription emails and display them
                  to you.
                </li>
                <li>
                  <TextImportant>profile</TextImportant> - View your basic
                  profile. We use this to show your name when you log in with
                  Microsoft.
                </li>
              </ul>

              <p>
                Read more about the{' '}
                <TextLink href={scopesUrlForOutlook}>Microsoft</TextLink> OAuth
                scopes.
              </p>
              <p>
                You can view your Microsoft App permissions or revoke access to
                Leave Me Alone at any time{' '}
                <TextLink href={revokeUrlForOutlook}>here</TextLink>.
              </p>
            </div>
            <div styleName="image-section-img bordered">
              <img alt="Outlook permissions requested" src={outlookScopesImg} />
            </div>
          </div>
        </div>

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
          <div styleName="image-section-img smaller">
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
            <h2>How do we power Subscriber Score?</h2>
            <p>
              The metadata powering Subscriber Score is derived from the sender
              of the email.
            </p>
            <p>So that we can generate the score we record:</p>
            <ul styleName="list">
              <li>The frequency of emails from a specific sender</li>
              <li>The quantity of addresses that sender uses</li>
              <li>How often users unsubscribe from emails from that sender</li>
              <li>
                How frequently emails from that sender are seen as spam or trash
              </li>
            </ul>
            <p>
              We then calculate a ranking using some secret sauce mathematics,
              which grades each sender using the stats above.
            </p>
            <p>
              It is not possible for this data to be associated with a Leave Me
              Alone account or email address.
            </p>
            <p>
              This system improves the quality of Leave Me Alone for all users.
              If you don't want to contribute your data to this algorithm for
              whatever reason you can opt-out at any time from your account
              preferences.
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
            <a href="mailto:security@leavemealone.app">get in touch</a> - we
            will be happy to help!
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
