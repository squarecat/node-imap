import './alternatives.module.scss';

import React, { useMemo } from 'react';
import Testimonial, {
  PublicationQuote
} from '../components/landing/testimonial';
import { TextHighlight, TextImportant, TextLink } from '../components/text';

import { Arrow as ArrowIcon, SearchIcon } from '../components/icons';
import MailListIllustration from '../components/landing/illustration';
import SubpageLayout from '../layouts/subpage-layout';
import broomImg from '../assets/enterprise/broom.png';
import envelopeImg from '../assets/open-envelope-love.png';
import lockImg from '../assets/security/lock.png';
import logo from '../assets/logo.png';
import numeral from 'numeral';
import request from '../utils/request';
import treeImg from '../assets/climate/tree.png';
import useAsync from 'react-use/lib/useAsync';

const cdnUrl = `${process.env.CDN_URL}/images`;
const metaImgUrl = `${cdnUrl}/meta/leave-me-alone-vs-cleanfox.png`;

function CleanfoxAlternative() {
  const { error: statsError, value: statsData } = useAsync(fetchStats, []);

  const joinContent = useMemo(() => {
    if (statsError) {
      return null;
    }
    const userCount = statsData ? formatNumber(statsData.users) : 0;
    return (
      <p styleName="join-text">
        Join <TextImportant>{userCount} people</TextImportant> who chose{' '}
        <TextImportant>Leave Me Alone</TextImportant> instead of Cleanfox.
      </p>
    );
  }, [statsData, statsError]);

  return (
    <SubpageLayout
      title={`A Cleanfox Alternative - Leave Me Alone`}
      description={`Leave Me Alone is an Cleanfox alternative that also makes it easy to unsubscribe. See why people are switching from Cleanfox. Try Leave Me Alone free today!`}
      slug="/cleanfox-alternative"
      imgUrl={metaImgUrl}
      withContent={false}
    >
      <div styleName="alternative-inner">
        <div styleName="container">
          <div styleName="container-text">
            <h1 styleName="title">
              The Cleanfox alternative for unsubscribing in all your accounts
            </h1>
            {/* The Cleanfox alternative for all of your mailboxes */}
            <p styleName="tagline">
              Leave Me Alone is a Cleanfox alternative that{' '}
              <TextImportant>
                connects to all your mailboxes at once
              </TextImportant>{' '}
              so you can unsubscribe from all unwanted emails in one place.
            </p>
            <a href="/signup" className={`beam-me-up-cta`}>
              Start Unsubscribing
            </a>
            {joinContent}
          </div>
          <div styleName="container-image">
            <MailListIllustration />
          </div>
        </div>
      </div>

      <div styleName="publication-section">
        <PublicationQuote centered bordered publication="lifehacker" />
      </div>

      {/* Comparison table */}
      <div styleName="alternative-inner comparison">
        <table styleName="table">
          <thead>
            <tr>
              <th styleName="head-cell"></th>
              <th styleName="head-cell">
                <div styleName="table-logo">
                  <img src={logo} alt="Leave Me Alone logo" />
                  <span styleName="col-title lma">Leave Me Alone</span>
                </div>
              </th>
              <th styleName="head-cell">
                <span styleName="col-title alternative">Cleanfox</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td styleName="cell">Pricing</td>
              <td styleName="cell">Starts at $2.50 for 50 credits</td>
              <td styleName="cell">Free</td>
            </tr>
            <tr>
              <td styleName="cell">
                Unsubscribe from emails in all mailboxes together
              </td>
              <td styleName="cell">
                Yes - connects all email addresses to one Leave Me Alone account
              </td>
              <td styleName="cell">No</td>
            </tr>
            <tr>
              <td styleName="cell">Privacy policy</td>
              <td styleName="cell">Never sells any data, even anonymized</td>
              <td styleName="cell">
                Market-intelligence company which sells anonymized data that
                respects your privacy
              </td>
            </tr>
            <tr>
              <td styleName="cell">Live chat support</td>
              <td styleName="cell">Yes</td>
              <td styleName="cell">No</td>
            </tr>
            <tr>
              <td styleName="cell">Fighting digital pollution</td>
              <td styleName="cell">
                <span styleName="tree">
                  Yes{' '}
                  <span styleName="tree-img">
                    <TextLink undecorated href="/save-the-planet">
                      <img src={treeImg} />
                    </TextLink>
                  </span>
                </span>
              </td>
              <td styleName="cell">
                <span styleName="tree">
                  Yes{' '}
                  <span styleName="tree-img">
                    <img src={treeImg} />
                  </span>
                </span>
              </td>
            </tr>
            <tr>
              <td styleName="cell">Ranking of subscriptions</td>
              <td styleName="cell">Yes</td>
              <td styleName="cell">Yes</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div styleName="alternative-inner">
        <Testimonial
          author="Ben Song, Director - SquareAlpha"
          text={
            <span>
              Using Leave Me Alone to clean up my inbox has{' '}
              <TextHighlight>saved me countless hours</TextHighlight>.
            </span>
          }
          centered
          image={`${cdnUrl}/testimonials/image-16.jpg`}
        />
      </div>

      <div styleName="alternative-inner">
        <div styleName="features">
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={broomImg} alt="broom sweeping image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">Clean all mailboxes</h3>
              <p>
                Leave Me Alone is a Cleanfox competitor that offers the same
                instant unsubscribe service, but for all of your email accounts
                in one place. Simply connect your Gmail, Outlook, and any other
                inbox to one Leave Me Alone account and we show you all of your
                newsletters.
              </p>
              <p>
                <TextLink as="link" linkTo="/learn">
                  See all features <ArrowIcon inline width="12" height="12" />
                </TextLink>
              </p>
            </div>
          </div>
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={envelopeImg} alt="private envelope image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">Spammer ranking</h3>
              <p>
                We make it easy to quickly determine which emails are worth your
                time with our ranking system, Subscription Score. We give each
                sender a rating based on the frequency of emails from a specific
                sender, the quantity of addresses that sender uses, and more.
              </p>
              <p>
                <TextLink as="link" linkTo="/security#subscription-score">
                  More on Subscription Score{' '}
                  <ArrowIcon inline width="12" height="12" />
                </TextLink>
              </p>
            </div>
          </div>
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={lockImg} alt="lock face image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">Serious about security</h3>
              <p>
                When we search your inbox for newsletters the emails are passed
                directly to you, and never stored on our server. When you log
                out, all your emails are cleared, and they will be re-fetched
                from your mail provider next time you log in.
              </p>
              <p>
                <TextLink as="link" linkTo="/security">
                  Our security commitment{' '}
                  <ArrowIcon inline width="12" height="12" />
                </TextLink>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div styleName="alternative-inner">
        <Testimonial
          text={
            <span>
              I just used Leave Me Alone and{' '}
              <TextHighlight>
                unsubscribed to 15 emails in 3 minutes
              </TextHighlight>{' '}
              What a great idea!
            </span>
          }
          author="Tom Haworth, Managing Director - B13"
          image={`${cdnUrl}/testimonials/image-11.jpg`}
          centered
        />
      </div>

      <div styleName="questions">
        <div styleName="alternative-inner">
          <h2>Can you tell me...</h2>
          <div styleName="questions-grid">
            <div styleName="question">
              <h3>
                <span styleName="question-icon">
                  <SearchIcon width={20} height={20} />
                </span>{' '}
                How many mailboxes can I connect?
              </h3>
              <p>
                All of them! There is no limit on the number of email addresses
                you can connect to Leave Me Alone. You'll even get some extra
                free credits for connecting more!
              </p>
            </div>

            <div styleName="question">
              <h3>
                <span styleName="question-icon">
                  <SearchIcon width={20} height={20} />
                </span>{' '}
                My data. Do you ever sell it?
              </h3>
              <p>
                Nope, not ever. We don't share or sell any of your information.
                You can deactivate your account at any time, which deletes all
                of your data, and signs you out.
              </p>
            </div>
            <div styleName="question">
              <h3>
                <span styleName="question-icon">
                  <SearchIcon width={20} height={20} />
                </span>{' '}
                Can I get help from a real person?
              </h3>
              <p>
                Yes! Leave Me Alone is built real people who want to help you
                get a cleaner inbox. If you're having trouble with anything,
                then the creators James or Danielle (hi!) will personally help
                you.
              </p>
            </div>
            <div styleName="question">
              <h3>
                <span styleName="question-icon">
                  <SearchIcon width={20} height={20} />
                </span>{' '}
                Does unsubscribing really help the planet?
              </h3>
              <p>
                Every email sent produces 4g of carbon, even if you don't read
                it! By unsubscribing from the ones you don't want you are
                helping to reduce your carbon footprint on our planet.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div styleName="alternative-inner end-stuff">
        <h2>Your search for a Cleanfox alternative is over.</h2>
        <p>
          Sign up to Leave Me Alone to unsubscribe from mailing lists in all of
          your mailboxes at the same time. Clean your inbox & save our planet!
        </p>
        <a
          href="/signup"
          event={'clicked-unsubscriber-alternative-cta'}
          className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert`}
          style={{ margin: '50px auto' }}
        >
          Clean My Inbox
        </a>
        <PublicationQuote centered publication="makermag" />
      </div>
    </SubpageLayout>
  );
}

export default CleanfoxAlternative;

function fetchStats() {
  return request('/api/stats?summary=true');
}
function formatNumber(n) {
  return n > 999999 ? numeral(n).format('0a') : numeral(n).format('0,0');
}
