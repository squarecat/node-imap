import React from 'react';
// import Layout from '../layouts/layout';
import SubPageLayout from '../layouts/subpage-layout';

const EnterprisePage = () => {
  return (
    <SubPageLayout page="Enterprise" className="subpage-enterprise">
      <h1 className="enterprise-title">Enterprise Pricing Plan 📈</h1>
      <h2>Coming soon!</h2>
      <p>
        We will offer a subscription service for companies looking to help their
        employees <span className="text-important">boost productivity</span> and
        spend less time on emails.
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
      className="validate"
      target="_blank"
      noValidate
    >
      <div id="mc_embed_signup_scroll" className="signup">
        <div className="mc-field-group form-group">
          <input
            type="text"
            name="EMAIL"
            className="required email form-input"
            id="mce-EMAIL"
            required="required"
          />
          <label htmlFor="mce-EMAIL" className="form-label">
            Email Address
          </label>
        </div>
        <div id="mce-responses" className="clear">
          <div
            className="response"
            id="mce-error-response"
            style={{ display: 'none' }}
          />
          <div
            className="response"
            id="mce-success-response"
            style={{ display: 'none' }}
          />
        </div>
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
        <div className="clear">
          <input
            type="submit"
            value="Subscribe"
            name="subscribe"
            id="mc-embedded-subscribe"
            className="button btn centered"
          />
        </div>
      </div>
    </form>
  );
}
