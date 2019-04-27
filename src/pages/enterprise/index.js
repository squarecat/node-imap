import './enterprise.module.scss';

import { FormGroup, FormInput, FormLabel } from '../../components/form';

import Emoji from '../../components/emoji';
import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import { TextImportant } from '../../components/text';

const EnterprisePage = () => {
  return (
    <SubPageLayout title="Enterprise pricing plan" centered>
      <h1>Enterprise Pricing Plan</h1>
      <Emoji smaller>📈</Emoji>
      <h2>Coming soon!</h2>
      <p>
        We will offer a subscription service for companies looking to help their
        employees <TextImportant>boost productivity</TextImportant> and spend{' '}
        <TextImportant>less time on emails</TextImportant>.
      </p>
      <p>Subscribe for discounted early access:</p>
      {subscribeEnterpriseEarlyAccess()}
    </SubPageLayout>
  );
};

export default EnterprisePage;

function subscribeEnterpriseEarlyAccess() {
  return (
    <form
      action="https://xyz.us16.list-manage.com/subscribe/post?u=cdadb0a9f5c77af011b1d5243&amp;id=2d36d36040"
      method="post"
      id="mc-embedded-subscribe-form"
      name="mc-embedded-subscribe-form"
      target="_blank"
      noValidate
    >
      <div id="mc_embed_signup_scroll">
        <FormGroup>
          <FormInput id="mce-EMAIL" type="text" name="email" required />
          <FormLabel animated htmlFor="mce-EMAIL">
            Email Address
          </FormLabel>
        </FormGroup>
        <div
          style={{ position: 'absolute', left: '-5000px' }}
          aria-hidden="true"
        >
          <input
            type="text"
            name="b_cdadb0a9f5c77af011b1d5243_c26f88c816"
            tabIndex="-1"
          />
        </div>
        <div>
          <button type="submit" name="subscribe" styleName="subscribe-btn">
            Subscribe
          </button>
        </div>
      </div>
    </form>
  );
}
