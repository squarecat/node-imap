import { FormNotification } from '../../../../components/form';
import { Link } from 'gatsby';
import React from 'react';
import SubPageLayout from '../../../../layouts/subpage-layout';

export default function Terms() {
  return (
    <SubPageLayout
      title="Privacy Policy"
      description={`Our privacy policy explains what information we collect and why. We do not store the content of any of your emails in any form.`}
      slug="/privacy"
    >
      <p>
        <FormNotification warning>
          This is an out of date version of our privacy policy. This document is
          no longer in effect. You can view the latest version{' '}
          <Link
            style={{ color: 'white', borderBottom: '1px dashed white' }}
            to="/privacy"
          >
            here
          </Link>
          .
        </FormNotification>
      </p>
      <h2>Privacy Policy</h2>
      <p>
        Your privacy is important to us. It is our policy to respect your
        privacy regarding any information we may collect from you across our
        website, <a href="https://leavemealone.app">https://leavemealone.app</a>
        , and any other sites we own and operate.
      </p>
      <p>
        We only ask for personal information when we truly need it to provide a
        service to you. We collect it by fair and lawful means, with your
        knowledge and consent. We also let you know why we’re collecting it and
        how it will be used.
      </p>
      <p>
        We only retain collected information for as long as necessary to provide
        you with your requested service. What data we store, we protect within
        commercially acceptable means to prevent loss and theft, as well as
        unauthorised access, disclosure, copying, use or modification.
      </p>
      <h3>The Service</h3>
      <p>
        We do not store content of any of your emails on our servers{' '}
        <strong>in any form</strong>.
      </p>
      <p>
        That said, we do store specific metadata of your emails in order to
        identify if you have unsubscribed from a subscription previously. This
        is limited only to recipient and sender email addresses of the
        subscription emails that you have unsubscribed from, as well as
        timestamp, and is encrypted by industry standard AES256 cipher.
      </p>
      <p>
        When we scan your inbox, your emails are passed directly to you and
        stored by your browser while you are logged in. When you log out, this
        data is cleared permanently and irrevocably. The next time you log in,
        it will be re-fetched from your email provider(s).
      </p>
      <p>
        You can read more about the above on our{' '}
        <a href="/security">security page</a>.
      </p>
      <p>
        We believe your data is safe, but if you any suggestions on how we can
        improve then{' '}
        <a href="https://twitter.com/leavemealoneapp">let us know!</a>
      </p>
      <p>
        We are dedicated to upholding the privacy of your information and
        promise to never do anything with this data except provide you an
        excellent service through this website. All personal records, including
        your keys and metadata is encrypted at rest in our database.
      </p>
      <p>
        We don’t share any personally identifying information publicly or with
        third-parties, except when required to by law. To date this has never
        been requested and we can't imagine why it would be.
      </p>
      <p>
        Our website may link to external sites that are not operated by us.
        Please be aware that we have no control over the content and practices
        of these sites, and cannot accept responsibility or liability for their
        respective privacy policies.
      </p>
      <p>
        You are free to refuse our request for your personal information, with
        the understanding that we may be unable to provide you with some or all
        of our service.
      </p>
      <p>
        You are free at any time to request any personal information we have for
        you as dictated by the General Data Protection Regulation (GDPR). Under
        the same, we will also delete any or all of this information at your
        request.
      </p>
      <p>
        In addition, you can choose to delete your account from the profile
        page, which results in your data being automatically removed
        irreversibly from our system and your browser.
      </p>
      <h3>Subscription Score</h3>
      <p>
        During your use of The Service, we store metadata of your subscription
        emails to power our Subscription Score algorithm. This metadata includes
        how many times you have received a specific subscription email, if it
        was seen in your spam or trash, and if you choose to unsubscribe from
        it.
      </p>
      <p>
        We only ever store metadata about your subscription emails. We never
        touch any other emails.
      </p>
      <p>
        This data is stored without any personally identifiable information and
        only ever used in aggregate to generate the score, and thus cannot be
        associated with you in any way.
      </p>
      <p>
        If you wish to opt-out of this service, then you can disable it from the
        preferences page when logged in. When opted-out we will cease collecting
        this information about your subscriptions immediately, but any existing
        data will be retained as we do not know which data belonged to you.
      </p>
      <hr />
      <p>
        Your continued use of our website will be regarded as acceptance of our
        practices around privacy and personal information. If you have any
        questions about how we handle user data and personal information, feel
        free to contact us.
      </p>
      <p>Last updated 23rd July 2019.</p>
    </SubPageLayout>
  );
}
