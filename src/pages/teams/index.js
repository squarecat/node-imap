import './teams.module.scss';

import Testimonial, {
  NewsBar,
  TrustBar
} from '../../components/landing/testimonial';
import { TextHighlight, TextImportant, TextLink } from '../../components/text';

import { Arrow as ArrowIcon } from '../../components/icons';
import { Enterprise } from '../pricing';
import EnterpriseEstimator from '../../components/estimator/enterprise';
import MailListIllustration from '../../components/landing/illustration';
import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import broom from '../../assets/enterprise/broom.png';
import envelope from '../../assets/open-envelope-love.png';
import googleLogo from '../../assets/providers/google/gsuite-logo.png';
import happy from '../../assets/enterprise/happy.png';
import luke from '../../assets/testimonials/luke.jpeg';
import officeLogo from '../../assets/providers/microsoft/office-365-logo.png';
import securityImg from '../../assets/security/security.png';
import steph from '../../assets/testimonials/steph.jpg';

const TeamsPage = () => {
  return (
    <SubPageLayout
      title="Leave Me Alone for Teams"
      description={`The most efficient businesses work without interruption. Take back control of your office from unwanted emails.`}
      withContent={false}
      slug="/teams"
    >
      <div styleName="enterprise-inner">
        <div styleName="container">
          <div styleName="container-text">
            <h1 styleName="title">Productive Teams Use Leave Me Alone</h1>
            <p styleName="tagline">
              The most efficient businesses work without interruption. Take back
              control of your office from unwanted emails.
            </p>
            <a
              event="clicked-teams-cta"
              href="/signup?teams=true"
              className={`beam-me-up-cta`}
            >
              Get Started
            </a>
          </div>
          <div styleName="container-image">
            <MailListIllustration />
          </div>
        </div>

        <div styleName="features">
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={happy} alt="happy face image" />
            </div>
            <h3 styleName="feature-title">Inbox sanity for happy teams</h3>
            <p styleName="feature-text">
              Receiving unwanted subscription emails is a source of annoyance,
              frustration and interruption. Leave Me Alone makes it quick and
              easy to unsubscribe so that your team can focus on building your
              business.
            </p>
          </div>
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={broom} alt="broom sweeping image" />
            </div>
            <h3 styleName="feature-title">Clean all accounts together</h3>
            <p styleName="feature-text">
              Email is necessary for company communication. Each team member can
              connect all of their email accounts and see all of their
              subscription emails in one go. Make email a productive tool again.
            </p>
          </div>
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={envelope} alt="private envelope image" />
            </div>
            <h3 styleName="feature-title">Stay focused and productive</h3>
            <p styleName="feature-text">
              When you unsubscribe we don't just move your mail into a folder or
              to trash, instead we actually unsubscribe you from the list. Your
              company will be clear of subscriptions forever, even if you decide
              to stop using our service.
            </p>
          </div>
        </div>
      </div>

      <div styleName="featured">
        <NewsBar />
      </div>

      <div styleName="enterprise-inner testimonial">
        <Testimonial
          text={
            <span>
              I love how Leave Me Alone{' '}
              <TextHighlight>
                seamlessly allows you to visualize your inbox and then remove
                the junk - permanently
              </TextHighlight>
              ! I found the product so valuable that I ended up buying scans for
              my entire team.
            </span>
          }
          author="Steph Smith, Head of Publications - Toptal"
          image={steph}
          centered
        />
      </div>

      <TrustBar label="Used by employees at: " dark />

      <div styleName="security">
        <div styleName="enterprise-inner">
          <div styleName="image-section">
            <div styleName="image-section-text">
              <h2>Peace of mind for data security and privacy</h2>
              <p>
                We <TextImportant inverted>NEVER</TextImportant> compromise our
                customers' privacy.
              </p>
              <p>
                Leave Me Alone never stores the content of any emails. Emails we
                scan on your behalf are streamed directly to you, and not stored
                on our system. Sensitive company and customer information
                remains private, as it should be.
              </p>
              <p>
                <TextLink inverted href="/security">
                  Learn more about security{' '}
                  <ArrowIcon inline width="14" height="14" />
                </TextLink>
              </p>
            </div>
            <div styleName="image-section-img">
              <img src={securityImg} alt="list of our security features" />
            </div>
          </div>
        </div>
      </div>

      {/* <div styleName="enterprise-inner">
        <div styleName="trustbar">
          <h2>As seen in</h2>
          <div styleName="trustbar-logos">
            {companies.map(({ url, logoUrl }) => (
              <a key={url} target="_" styleName="trustbar-logo" href={url}>
                <img src={logoUrl} />
              </a>
            ))}
          </div>
        </div>
      </div> */}

      <div styleName="enterprise-inner">
        <div styleName="pricing">
          <div styleName="pricing-description">
            <h2>Pricing</h2>
            <p>
              Did you know that on average your office spends{' '}
              <TextImportant>28 percent</TextImportant> of the work week on
              email? That's almost 12 hours a week per employee!
              <a styleName="cite-link" href="#cite-1">
                <sup>[1]</sup>
              </a>
            </p>
            <p>
              About <TextImportant>one in ten</TextImportant>
              <a styleName="cite-link" href="#cite-2">
                <sup>[2]</sup>
              </a>{' '}
              of these emails are subscriptions, and many are completely
              useless!
            </p>
            <p>
              Our prices for teams let every member of your team completely
              clean their inbox of all unwanted subscriptions for a fixed price
              per user.
            </p>
            <p>
              We support any Google or Microsoft email accounts, including those
              with custom domains on G Suite and Office 365.
            </p>
            <div styleName="provider-logos">
              <img src={officeLogo} />
              <img styleName="gsuite" src={googleLogo} />
            </div>
            <p>
              <a href="/signup?teams=true">Sign up for teams</a> now, or{' '}
              <a href="mailto:teams@leavemealone.app">contact us</a> for more
              information.
            </p>

            <Testimonial
              text={
                <span>
                  Using Leave Me Alone has resulted in a{' '}
                  <TextHighlight>17% reduction in my emails</TextHighlight>,
                  saving me hours of time each month.
                </span>
              }
              author="Luke Chadwick, Founder - GraphQL360"
              image={luke}
            />
          </div>
          <Enterprise />
        </div>
        <div styleName="savings">
          <EnterpriseEstimator title="How much time can we save?" />
        </div>

        <div styleName="end-stuff">
          <h2>Find out more about Leave Me Alone for your company</h2>
          <a
            event="clicked-teams-company-cta"
            href="/signup?teams=true"
            className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert`}
            style={{ margin: '50px auto' }}
          >
            Sign Up Now
          </a>
          <p>
            Part of a charity or non-profit?{' '}
            <TextLink href="mailto:teams@leavemealone.app">
              Get in touch
            </TextLink>{' '}
            - we would love to help you!
          </p>
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
                Directly from our <a href="/open">anonymous usage stats</a>, on
                average between 8 and 10% of all emails we see are subscription
                emails.
              </cite>
            </li>
            <li id="cite-3">
              <sup>[3]</sup>
              <cite>
                An{' '}
                <a href="https://www.radicati.com/wp/wp-content/uploads/2015/02/Email-Statistics-Report-2015-2019-Executive-Summary.pdf">
                  average of 96 business emails is received per worker every day
                </a>{' '}
                in 2019.
              </cite>
            </li>
            <li id="cite-4">
              <sup>[4]</sup>
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
      </div>
    </SubPageLayout>
  );
};

export default TeamsPage;
