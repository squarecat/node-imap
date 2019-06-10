import './credits.module.scss';

import Modal, {
  ModalBody,
  ModalCloseIcon,
  ModalHeader,
  ModalSubHeader
} from '..';

import Button from '../../btn';
import { InlineFormInput } from '../../form';
import { Link } from 'gatsby';
import React from 'react';
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
      style={{ width: 680 }}
    >
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
            <Button compact inline smaller basic>
              Buy more
            </Button>
          </span>
        </p>
        <ModalSubHeader>Invite friends and Earn Credit</ModalSubHeader>
        <p>
          You’ll receive{' '}
          <TextImportant>20 free unsubscribe credits</TextImportant> when the
          person you invite signs up for an account, and they’ll also get{' '}
          <TextImportant>10 extra credits</TextImportant> to get started.
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
