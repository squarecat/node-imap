import './enterprise.module.scss';

import { Enterprise } from '../pricing';
import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import googleLogo from '../../assets/gsuite-logo.png';
import officeLogo from '../../assets/office-365-logo.png';

const EnterprisePage = () => {
  return (
    <SubPageLayout
      title="Enterprise Pricing"
      description="Boost productivity and get an office that is completely free of unwanted spam and subscription emails with our enterprise plan."
    >
      <div className="pricing-page">
        <div className="pricing-description">
          <h2>Enterprise Pricing</h2>
          <p>
            Fancy an office email that is completely free of spammy
            subscriptions?
          </p>
          <p>
            Our Enterprise prices are billed per seat so every one of your
            employees can completely clean their inbox.
          </p>
          <p>
            We support any Google or Microsoft email accounts, including those
            with custom domains on G Suite and Office 365.
          </p>
          <p>
            <a href="mailto:hello@leavemealone.app">Contact us</a> for more
            information or to start setting up your account today!
          </p>
          <div styleName="enterprise-logos">
            <img src={officeLogo} />
            <img styleName="gsuite" src={googleLogo} />
          </div>
        </div>
        <Enterprise />
      </div>
    </SubPageLayout>
  );
};

export default EnterprisePage;
