import './credits.module.scss';

import Modal, {
  ModalBody,
  ModalCloseIcon,
  ModalHeader,
  ModalSubHeader
} from '..';

import Button from '../../btn';
import { InlineFormInput } from '../../form';
import React from 'react';
import { TwitterIcon } from '../../icons';
import request from '../../../utils/request';
import { useAsync } from 'react-use';

async function getRewards() {
  return request('/api/me/milestones');
}

async function getReferrals() {
  return request('/api/me/referrals');
}

export default ({ shown = true, onClose, credits }) => {
  const { loading, value } = useAsync(getRewards);
  const { loading: referralsLoading, value: referralValue } = useAsync(
    getReferrals
  );

  const { rewards } = (value || []).reduce(
    (out, ms) => {
      if (referralLabels[ms.name]) {
        return {
          referrals: [...out.referrals, ms],
          rewards: out.rewards
        };
      }
      return {
        referrals: out.referrals,
        rewards: [...out.rewards, ms]
      };
    },
    { referrals: [], rewards: [] }
  );
  return (
    <Modal
      shown={shown}
      onClose={onClose}
      dismissable={false}
      style={{ width: 580 }}
    >
      <ModalCloseIcon />
      <ModalBody>
        <ModalHeader>Credit Balance</ModalHeader>
        <p styleName="balance">
          <span styleName="balance-text">
            Your current credit balance is{' '}
            <span styleName="credit-balance">{credits}</span>
          </span>
          <span styleName="action">
            <Button compact inline smaller basic>
              Buy more
            </Button>
          </span>
        </p>
        <ModalSubHeader>Invite friends and Earn Credit</ModalSubHeader>
        <p>
          You’ll receive 20 unsubscribe credits when the person you invite signs
          up for an account, and they’ll also get 5 extra credits to get
          started.
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
    </Modal>
  );
};

const rewardLabels = {
  sharedOnTwitter: {
    icon: <TwitterIcon />,
    text: 'Share on Twitter'
  },
  completedOnboarding: {
    icon: <TwitterIcon />,
    text: 'Connect first account'
  },
  connectedAdditionalAccount: {
    icon: <TwitterIcon />,
    text: 'Connect more accounts'
  },
  addedTwoFactorAuth: {
    icon: <TwitterIcon />,
    text: 'Add two factor auth'
  },
  reached100Unsubscribes: {
    icon: null,
    text: 'Reach 100 total unsubscribes'
  },
  reached500Unsubscribes: {
    icon: null,
    text: 'Reach 500 total unsubscribes'
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
    <ul styleName="earn-credit">
      {referredBy ? (
        <li key={referredBy.email}>
          <div styleName="earn-description earn-description-email">
            <span styleName="earn-email">{referredBy.email}</span>
            <span>referred you</span>
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
          <div styleName="earn-description earn-description-email">
            <span>{email}</span>
            <span>was referred by you</span>
          </div>
          <div styleName="earn-status">
            <span styleName="earn-amount">{`${reward} credits`}</span>
            <span styleName="earn-checkbox" data-checked="true" />
          </div>
        </li>
      ))}
    </ul>
  );
  // const rewardItems = referralList.map(r => {
  //   return {
  //     ...referralLabels[r.name],
  //     reward: r.unsubscriptions,
  //     awarded: r.timesCompleted,
  //     name: r.name
  //   };
  // });
  // return rewardList(rewardItems);
}

function getRewardList(rewards = []) {
  const rewardItems = rewards.map(r => {
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
      {rewardItems.map(({ text, icon, name, reward, awarded }) => (
        <li key={name}>
          <div styleName="earn-description">
            {icon}
            <span>{text}</span>
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
