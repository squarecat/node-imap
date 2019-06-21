import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';

export default function Terms() {
  return (
    <SubPageLayout
      title="Privacy Policy"
      description="Our privacy policy explains what information we collect and why. We do not store the content of any of your emails in any form. We do store metadata of your emails in order to identify if you have unsubscribed from a subscription in a previous scan."
    >
      <h2>Privacy Policy</h2>
      <p>
        Your privacy is important to us. It is Squarecat's policy to respect
        your privacy regarding any information we may collect from you across
        our website,{' '}
        <a href="https://leavemealone.xyz">https://leavemealone.xyz</a>, and
        other sites we own and operate.
      </p>
      <p>
        We only ask for personal information when we truly need it to provide a
        service to you. We collect it by fair and lawful means, with your
        knowledge and consent. We also let you know why we’re collecting it and
        how it will be used.
      </p>
      <p>
        We only retain collected information for as long as necessary to provide
        you with your requested service. What data we store, we’ll protect
        within commercially acceptable means to prevent loss and theft, as well
        as unauthorised access, disclosure, copying, use or modification.
      </p>
      <p>
        We do not store content of any of your emails{' '}
        <strong>in any form</strong>.
      </p>
      <p>
        We do store metadata of your emails in order to identify if you have
        unsubscribed from a subscription in a previous scan. This is limited to
        recipient and sender email addresses, and a timestamp, and is encrypted
        by industry standard AES256 cipher.
      </p>
      <p>
        We believe your data is safe, but if you can think of any way we can
        avoid holding onto even this limited information and still provide the
        same level of service then{' '}
        <a href="https://twitter.com/leavemealoneapp">let us know!</a>
      </p>
      <p>
        We are dedicated to upholding the privacy of your data and promise to
        never do anything with this data except provide you an excellent service
        through this website. All information, including your keys and metadata
        is encrypted at rest in our database.
      </p>
      <p>
        We don’t share any personally identifying information publicly or with
        third-parties, except when required to by law.
      </p>
      <p>
        Our website may link to external sites that are not operated by us.
        Please be aware that we have no control over the content and practices
        of these sites, and cannot accept responsibility or liability for their
        respective privacy policies.
      </p>
      <p>
        You are free to refuse our request for your personal information, with
        the understanding that we may be unable to provide you with some of your
        desired services.
      </p>
      <p>
        Your continued use of our website will be regarded as acceptance of our
        practices around privacy and personal information. If you have any
        questions about how we handle user data and personal information, feel
        free to contact us.
      </p>
      <p>This policy is effective as of 27 November 2018.</p>
    </SubPageLayout>
  );
}
