import './credits.module.scss';

import Modal, {
  ModalBody,
  ModalCloseIcon,
  ModalHeader,
  ModalSubHeader
} from '..';
import React, { useMemo } from 'react';

import Button from '../../btn';
import { InlineFormInput } from '../../form';
import { Link } from 'gatsby';
import { TextImportant } from '../../text';
import { TwitterIcon } from '../../icons';
import request from '../../../utils/request';
import { useAsync } from 'react-use';

async function getRewards() {
  return request('/api/me/milestones');
}

async function getReferrals() {
  return request('/api/me/referrals');
}

export default ({ credits }) => {
  const { loading, value } = useAsync(getRewards);
  const { loading: referralsLoading, value: referralValue } = useAsync(
    getReferrals
  );

  const { referredCredits, referralCredits, rewards } = useMemo(
    () => {
      if (loading) {
        return {
          referralCredits: '-',
          referredCredits: '-',
          rewards: []
        };
      }
      const { referrals, rewardValues } = value.reduce(
        (out, ms) => {
          if (referralLabels[ms.name]) {
            return {
              referrals: [...out.referrals, ms],
              rewardValues: out.rewardValues
            };
          }
          return {
            referrals: out.referrals,
            rewardValues: [...out.rewardValues, ms]
          };
        },
        { referrals: [], rewardValues: [] }
      );

      return {
        referralCredits: referrals.find(r => r.name === 'referralSignUp')
          .unsubscriptions,
        referredCredits: referrals.find(r => r.name === 'signedUpFromReferral')
          .unsubscriptions,
        rewards: rewardValues
      };
    },
    [loading, value]
  );

  return (
    <div styleName="credits-modal">
      <ModalBody>
        <ModalHeader>
          Credit Balance
          <ModalCloseIcon />
        </ModalHeader>
        <p styleName="balance">
          <span styleName="balance-text">
            Your current credit balance is{' '}
            <span styleName="credit-balance">{credits}</span>
          </span>
          <span styleName="action">
            <Button
              as="link"
              linkTo="/app/profile/billing"
              compact
              inline
              smaller
              basic
            >
              Buy more
            </Button>
          </span>
        </p>
        <ModalSubHeader>Invite friends and Earn Credit</ModalSubHeader>
        <p>
          You’ll receive{' '}
          <TextImportant>
            {referralCredits} free unsubscribe credits
          </TextImportant>{' '}
          when the person you invite signs up for an account, and they’ll also
          get <TextImportant>{referredCredits} extra credits</TextImportant> to
          get started.
        </p>

        <div styleName="invite-actions">
          <InlineFormInput
            smaller
            compact
            placeholder="Email address"
            name="email"
          >
            <Button fill basic smaller inline>
              Invite
            </Button>
          </InlineFormInput>
          <Button muted outlined stretch fill basic smaller inline>
            <TwitterIcon />
            Tweet
          </Button>
          <Button muted outlined stretch fill basic smaller inline>
            Copy link
          </Button>
        </div>
        {referralsLoading ? null : getReferralList(referralValue)}
        <ModalSubHeader>Other ways to Earn Credit</ModalSubHeader>
        {loading ? null : getRewardList(rewards)}
      </ModalBody>
    </div>
  );
};

const rewardLabels = {
  connectedFirstAccount: {
    text: 'Connect first account',
    description: (
      <span>
        <Link to="/app/profile/accounts">Connect</Link> your first account
      </span>
    )
  },
  connectedAdditionalAccount: {
    icon: <TwitterIcon />,
    text: 'Connect more accounts',
    description: (
      <span>
        <Link to="/app/profile/accounts">Connect</Link> another account
      </span>
    )
  },
  addedTwoFactorAuth: {
    icon: <TwitterIcon />,
    text: 'Add two factor auth',
    description: (
      <span>
        Make your account <Link to="/app/profile/security">more secure</Link>
      </span>
    )
  },
  sharedOnTwitter: {
    icon: <TwitterIcon />,
    text: 'Share on Twitter',
    description: (
      <span>
        <a href>Tweet about us</a> to your followers
      </span>
    )
  },
  reached100Unsubscribes: {
    icon: null,
    text: 'Reach 100 total unsubscribes',
    description: <span>Become a Leave Me Alone super user!</span>
  },
  reached500Unsubscribes: {
    icon: null,
    text: 'Reach 500 total unsubscribes',
    description: <span>We'll personally name you an unsubscribe master!</span>
  }
};

const referralLabels = {
  referralSignUp: {
    icon: null,
    text: 'was referred by you'
  },
  signedUpFromReferral: {
    text: 'referred you'
  }
};
function getReferralList({ referredBy, referrals }) {
  return (
    <ul styleName="earn-credit earn-credit-referrals">
      {referredBy ? (
        <li key={referredBy.email}>
          <div styleName="earn-description">
            <span styleName="earn-email">{referredBy.email}</span>
            <span styleName="earn-description-text">referred you</span>
          </div>
          <div styleName="earn-status">
            <span styleName="earn-amount">{`${
              referredBy.reward
            } credits`}</span>
            <span styleName="earn-checkbox" data-checked="true" />
          </div>
        </li>
      ) : null}
      {referrals.map(({ email, reward }) => (
        <li key={email}>
          <div styleName="earn-description">
            <span>{email}</span>
            <span styleName="earn-description-text">was referred by you</span>
          </div>
          <div styleName="earn-status">
            <span styleName="earn-amount">{`${reward} credits`}</span>
            <span styleName="earn-checkbox" data-checked="true" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function getRewardList(rewards = []) {
  const rewardItems = rewards
    .filter(r => rewardLabels[r.name])
    .map(r => {
      return {
        ...rewardLabels[r.name],
        reward: r.unsubscriptions,
        awarded: r.timesCompleted,
        name: r.name
      };
    });
  return rewardList(rewardItems);
}

function rewardList(rewardItems) {
  return (
    <ul styleName="earn-credit">
      {rewardItems.map(({ text, name, reward, awarded, description }) => (
        <li key={name}>
          <div styleName="earn-description">
            <span>{text}</span>
            <span styleName="earn-description-text">{description}</span>
          </div>
          <div styleName="earn-status">
            <span styleName="earn-amount">{`${reward} credits`}</span>
            <span styleName="earn-checkbox" data-checked={awarded > 0} />
          </div>
        </li>
      ))}
    </ul>
  );
}
