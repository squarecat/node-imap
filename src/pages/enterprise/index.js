import './enterprise.module.scss';

import { Enterprise } from '../pricing';
import EnterpriseEstimator from '../../components/estimator/enterprise';
import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import { TextImportant } from '../../components/text';
import googleLogo from '../../assets/gsuite-logo.png';
import luke from '../../assets/luke.jpeg';
import officeLogo from '../../assets/office-365-logo.png';

const EnterprisePage = () => {
  return (
    <SubPageLayout title="Enterprise pricing plan">
      <div className="pricing-page">
        <div className="pricing-description">
          <h1>Enterprise Pricing</h1>
          <p>
            Did you know that on average your office spends{' '}
            <TextImportant>28 percent</TextImportant> of the work week on email?
            That's almost 12 hours a week per employee!
            <a styleName="cite-link" href="#cite-1">
              <sup>[1]</sup>
            </a>
          </p>
          <p>
            About <TextImportant>one in ten</TextImportant> of these emails are
            subscriptions, and many are completely useless!
          </p>
          <p>
            Our Enterprise prices let every one of your employees completely
            clean their inbox of all unwanted subscriptions for a fixed price
            per user.
          </p>
          <p>
            We support any Google or Microsoft email accounts, including those
            with custom domains on Gsuite and Office 365.
          </p>
          <div styleName="enterprise-logos">
            <img src={officeLogo} />
            <img styleName="gsuite" src={googleLogo} />
          </div>
          <p>
            <a href="mailto:hello@leavemealone.app">Contact us</a> for more
            information or to start setting up your account today!
          </p>
          <div styleName="testimonial">
            <blockquote styleName="blockquote">
              <p>
                “Using Leave Me Alone has resulted in a 17% reduction in my
                emails, saving me hours of time each month.”
              </p>
              <cite styleName="author">
                <img src={luke} />{' '}
                <span>Luke Chadwick, Founder - GraphQL360</span>
              </cite>
            </blockquote>
          </div>
        </div>
        <Enterprise />
      </div>
      <div styleName="savings">
        <EnterpriseEstimator title="How much time can I save?" />
      </div>
      <div styleName="sources">
        <ul>
          <li id="cite-1">
            <sup>[1]</sup>
            <cite>
              <a href="https://www.mckinsey.com/industries/high-tech/our-insights/the-social-economy">
                "The average interaction worker spends an estimated 28 percent
                of the workweek managing e-mail"
              </a>
            </cite>
          </li>
          <li id="cite-2">
            <sup>[2]</sup>
            <cite>
              An{' '}
              <a href="https://www.radicati.com/wp/wp-content/uploads/2015/02/Email-Statistics-Report-2015-2019-Executive-Summary.pdf">
                average of 96 business emails is received per worker every day
              </a>{' '}
              in 2019.
            </cite>
          </li>
          <li id="cite-3">
            <sup>[3]</sup>
            <cite>
              Based on{' '}
              <a href="https://www.radicati.com/wp/wp-content/uploads/2015/02/Email-Statistics-Report-2015-2019-Executive-Summary.pdf">
                1.1 minutes spent on each email
              </a>{' '}
              in 2019.
            </cite>
          </li>
        </ul>
      </div>
    </SubPageLayout>
  );
};

export default EnterprisePage;
