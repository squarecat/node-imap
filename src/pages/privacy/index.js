import { Link } from 'gatsby';
import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';

export default function Terms() {
  return (
    <SubPageLayout
      title="Privacy Policy"
      description={`Our privacy policy explains what information we collect and why. We do not store the content of any of your emails in any form.`}
      slug="/privacy"
    >
      <h2>Privacy Policy</h2>
      <p>
        Your privacy is important to us. It is our policy to respect your
        privacy regarding any information we may collect from you across our
        website, <a href="https://leavemealone.app">https://leavemealone.app</a>
        , and any other sites we own and operate.
      </p>
      <h4>Personal information</h4>
      <p>
        We only ask for personal information when we truly need it to provide
        the service to you. We collect it by fair and lawful means, with your
        knowledge and consent. We also let you know why we're collecting it and
        how it will be used.
      </p>
      <p>
        We only retain collected information for as long as necessary to provide
        you with your requested service. What data we store, we protect within
        commercially acceptable means to prevent loss and theft, as well as
        unauthorised access, disclosure, copying, use or modification.
      </p>
      <p>
        You are free to refuse our request for your personal information, with
        the understanding that we may be unable to provide you with some or all
        of our service.
      </p>
      <p>
        All personal records, including your keys and email metadata is
        encrypted at rest in our database.
      </p>

      <h4>GDPR</h4>
      <p>
        If you are an EU resident then you have the right at any time to request
        all the personal information we have for you as dictated by the General
        Data Protection Regulation (GDPR). Under the same regulation, we will
        also delete any or all of this information at your request.
      </p>
      <p>
        If you are not an EU resident then we will still provide this
        information to you if you ask for it, because we believe you should have
        these rights regardless of where in the world you live.
      </p>
      <p>
        In addition, you can choose to delete your account from the profile
        page, which results in your data being automatically removed
        irreversibly from our system and your browser.
      </p>

      <h3>The Service</h3>
      <h4>Emails and content</h4>
      <p>
        We do not store content of any of your emails on our servers{' '}
        <strong>in any form</strong>.
      </p>
      <p>
        When we scan your inbox, your emails are passed directly to you and
        stored by your browser while you are logged in. When you log out, this
        data is cleared permanently and irrevocably. The next time you log in,
        it will be re-fetched from your email provider(s).
      </p>
      <p>
        Performing scans like this means we do not need to store the content of
        your emails on our servers.
      </p>
      <p>
        That said, we do store specific metadata of your emails in order to
        identify if you have unsubscribed from a subscription previously. This
        is limited only to recipient and sender email addresses of the
        subscription emails that you have unsubscribed from, as well as
        timestamp, and is encrypted by industry standard AES256 cipher.
      </p>
      <p>
        You can read more about the above on our{' '}
        <a href="/security">security page</a>.
      </p>
      <p>
        We are dedicated to upholding the privacy of your information and
        promise to never do anything with this email metadata except provide you
        an excellent service through this website.
      </p>

      <h4>Third parties</h4>
      <p>
        We don't share any user data publicly or with third-parties, except when
        required to by law. To date this has never been requested and we can't
        imagine why it would be.
      </p>
      <p>
        We do use a few third-party scripts with whom we share non-personal data
        for the following purposes;
      </p>
      <ol>
        <li>
          <p>
            Page view analytics (
            <a href="https://simpleanalytics.com/privacy">Simple Analytics</a>)
          </p>
        </li>
        <li>
          <p>
            In-app support chat (
            <a href="https://github.com/squarecat/squarechat">Squarecat</a>)
          </p>
        </li>
        <li>
          <p>
            Cookie consent (
            <a href="https://metomic.io/privacy-policy">Metomic</a>)
          </p>
        </li>
        <li>
          <p>
            Error handling (<a href="https://sentry.io/privacy">Sentry</a>)
          </p>
        </li>
        <li>
          <p>
            Payment processing (
            <a href="https://stripe.com/en-ee/privacy">Stripe</a>)
          </p>
        </li>
      </ol>
      <p>
        We have ensured that the respective privacy policies of these companies
        align with our own values.
      </p>
      <h4>External sources</h4>
      <p>
        Our website may link to external sites that are not operated by us.
        Please be aware that we have no control over the content and practices
        of these sites, and cannot accept responsibility or liability for their
        respective privacy policies.
      </p>
      <p>
        To provide the unsubscription service we also occasionally display
        images to you that are fetched from external sites. The intention of
        these images is to show you if an particular unsubscribe was successful.
        However, we have no control over these images and cannot accept
        responsibility or liability for their content.
      </p>
      <p>
        These images can only seen by you, unless you specifically share them
        with us for product improvement purposes. If you want us to remove a
        specific image from our systems then let us know.
      </p>

      <h3>Subscription Score</h3>
      <p>
        During your use of The Service, we store metadata of your subscription
        emails to power our Subscription Score algorithm. This metadata includes
        how many times you have received a specific subscription email, if it
        was seen in your spam or trash, and if you chose to unsubscribe from it.
      </p>
      <p>
        We only ever use metadata derived from your subscription emails. We
        never see or touch any other emails.
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
      <p>
        The intention of this data is to determine which email addresses and
        domains are typically associated with good or bad email subscriptions.
      </p>
      <p>
        It is currently only used to improve the service, but we may make this
        information available in a restricted manner (such as through an API) in
        the future in order to develop other systems to help people unsubscribe
        from mailing lists or determine details about their email subscriptions.
      </p>

      <h3>Open Startup statistics</h3>
      <p>
        We collect statistical information such as the total quantity of emails
        we have scanned and the total number of subscriptions that have been
        unsubscribed from. As well as various financial details.
      </p>
      <p>
        This data does not contain any personal identifying information and is
        only stored as counts or percentages.
      </p>
      <p>
        We periodically share this information publicly with our followers on
        social media for the sole purpose of documenting and sharing our
        successes and failures as an{' '}
        <a href="https://blog.leavemealone.app/what-does-it-mean-to-be-an-open-startup/">
          "open startup"
        </a>
        , for the benefit of others and to keep ourselves accountable.
      </p>
      <p>
        You can see an example of what we do with this data on our{' '}
        <a href="https://leavemealone.app/open">open page</a>.
      </p>

      <hr />
      <p>
        We believe that by following these rules we can keep your data as safe
        as possible, but if you have any suggestions on how we can improve then{' '}
        <a href="https://twitter.com/leavemealoneapp">let us know!</a>
      </p>

      <p>
        Your continued use of our website will be regarded as acceptance of our
        practices around privacy and personal information. If you have any
        questions about how we handle any of our data, feel free to contact us.
      </p>
      <hr />
      <p>This policy was last updated on the 25th September 2019.</p>
      <h4>Previous versions:</h4>
      <p>
        For accountability we keep the old versions of our privacy policy around
        to view here.
      </p>
      <ol>
        <li>
          <p>
            <Link to="/privacy/history/23-07-2019">23rd July 2019</Link>
          </p>
        </li>
      </ol>
    </SubPageLayout>
  );
}
