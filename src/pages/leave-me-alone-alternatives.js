import './alternatives.module.scss';

import {
  AlternativeCheck,
  AlternativeCross
} from '../components/landing/alternatives/icons';
import React, { useMemo } from 'react';

import AlternativeCards from '../components/landing/alternatives/cards';
import MailListIllustration from '../components/landing/illustration';
import SubpageLayout from '../layouts/subpage-layout';
import { TextImportant } from '../components/text';
import broomImg from '../assets/enterprise/broom.png';
import envelopeImg from '../assets/open-envelope-love.png';
import lockImg from '../assets/security/lock.png';
import logo from '../assets/logo.png';
import numeral from 'numeral';
import { openChat } from '../utils/chat';
import request from '../utils/request';
import useAsync from 'react-use/lib/useAsync';

function LeaveMeAloneAlternatives() {
  const { error: statsError, value: statsData } = useAsync(fetchStats, []);

  const footerStats = useMemo(() => {
    if (statsError || !statsData) {
      return (
        <p>
          Ask us anything and find out why{' '}
          <TextImportant> people like you</TextImportant> are using Leave Me
          Alone!
        </p>
      );
    }
    return (
      <p>
        Ask us anything and find out why{' '}
        <TextImportant>
          {formatNumber(statsData.users)} people like you
        </TextImportant>{' '}
        are using Leave Me Alone!
      </p>
    );
  }, [statsData, statsError]);

  return (
    <SubpageLayout
      title={`See how Leave Me Alone compares to the competition`}
      description={`We want you to use the best service for unsubscribing, even if you don't choose us. Here's how Leave Me Alone compares to other services.`}
      slug="/leave-me-alone-alternatives"
      withContent={false}
    >
      <div styleName="alternative-inner">
        <div styleName="container">
          <div styleName="container-text">
            <h1 styleName="title">
              How does Leave Me Alone compare to the competition?
            </h1>
            <p styleName="tagline">
              We want you to choose the best unsubscribe service for you - even
              if it's not us.
            </p>
          </div>
          <div styleName="container-image">
            <MailListIllustration />
          </div>
        </div>
      </div>

      <div styleName="alternative-inner">
        <h2>When deciding on a service, think about...</h2>
        <div styleName="features">
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={lockImg} alt="lock face image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">Security</h3>
              <p>
                What permissions are you granting? Is your data every going to
                be sold (even anonymized)? What third-party tools are being
                used, and are they safe?
              </p>
            </div>
          </div>
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={broomImg} alt="broom sweeping image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">Cleaning</h3>
              <p>
                Will you be unsubscribed instantly? Do you need another folder
                in your inbox? Will the emails be gone forever, even if you stop
                using the service?
              </p>
            </div>
          </div>
          <div styleName="feature">
            <div styleName="feature-img">
              <img src={envelopeImg} alt="private envelope image" />
            </div>
            <div styleName="feature-text">
              <h3 styleName="feature-title">Management</h3>
              <p>
                Do you want to see all newsletters from all of your accounts
                together? Will a quality rating for subscriptions help you
                decide which emails to opt-out from?
              </p>
            </div>
          </div>
        </div>
      </div>

      <div styleName="alternative-inner">
        <h2>Compare all features side-by-side</h2>
        <p>
          There are several services that help you unsubscribe, we want to make
          it easy to choose the best one for you.
        </p>
        <p>
          We've put together this handy feature-by-feature comparison to help
          you compare us to the competition.
        </p>
      </div>

      <div styleName="alternative-inner all-comparisons">
        <div styleName="table-wrapper">
          <div styleName="table-inner">
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
                    <span styleName="col-title alternative">Unroll.Me</span>
                  </th>
                  <th styleName="head-cell">
                    <span styleName="col-title alternative">Unsubscriber</span>
                  </th>
                  <th styleName="head-cell">
                    <span styleName="col-title alternative">Cleanfox</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td styleName="cell">Pricing</td>
                  <td styleName="cell">Starts at $2.50</td>
                  <td styleName="cell">Free</td>
                  <td styleName="cell">Free</td>
                  <td styleName="cell">Free</td>
                </tr>
                <tr>
                  <td styleName="cell">Never sells anonymized data</td>
                  <td styleName="cell">
                    <AlternativeCheck />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                </tr>
                <tr>
                  <td styleName="cell">Connect multiple accounts</td>
                  <td styleName="cell">
                    <AlternativeCheck />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                  <td styleName="cell">
                    <AlternativeCheck />
                  </td>
                </tr>
                <tr>
                  <td styleName="cell">Instant unsubscribes</td>
                  <td styleName="cell">
                    <AlternativeCheck />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                  <td styleName="cell">
                    <AlternativeCheck />
                  </td>
                </tr>
                <tr>
                  <td styleName="cell">Ranking of subscriptions</td>
                  <td styleName="cell">
                    <AlternativeCheck />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                </tr>
                <tr>
                  <td styleName="cell">Show # of times received</td>
                  <td styleName="cell">
                    <AlternativeCheck />
                  </td>
                  <td styleName="cell">
                    <AlternativeCheck />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                  <td styleName="cell">
                    <AlternativeCheck />
                  </td>
                </tr>
                <tr>
                  <td styleName="cell">Sort and filter mail</td>
                  <td styleName="cell">
                    <AlternativeCheck />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                </tr>
                <tr>
                  <td styleName="cell">Available in the EU & EEA</td>
                  <td styleName="cell">
                    <AlternativeCheck />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                  <td styleName="cell">
                    <AlternativeCheck />
                  </td>
                  <td styleName="cell">
                    <AlternativeCheck />
                  </td>
                </tr>
                <tr>
                  <td styleName="cell">Live chat support</td>
                  <td styleName="cell">
                    <AlternativeCheck />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                </tr>
                <tr>
                  <td styleName="cell">Fighting digital pollution</td>
                  <td styleName="cell">
                    <AlternativeCheck />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                  <td styleName="cell">
                    <AlternativeCross />
                  </td>
                  <td styleName="cell">
                    <AlternativeCheck />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p styleName="helper-text">Psst, scroll to the right to see more →</p>
      </div>

      <div styleName="alternative-inner cards">
        <h2>Leave Me Alone vs. our competitors</h2>
        <p>
          One-on-one competition comparisons so you can make the best choice.
        </p>
        <AlternativeCards />
      </div>

      <div styleName="alternative-inner end-stuff">
        <h2>Still not sure which service is best for you?</h2>
        <p>{footerStats}</p>
        <a
          onClick={() => openChat()}
          className={`beam-me-up-cta beam-me-up-cta-center`}
          style={{ margin: '50px auto' }}
        >
          Chat with us
        </a>
      </div>
    </SubpageLayout>
  );
}

export default LeaveMeAloneAlternatives;

function fetchStats() {
  return request('/api/stats?summary=true');
}
function formatNumber(n) {
  return n > 999999 ? numeral(n).format('0a') : numeral(n).format('0,0');
}
