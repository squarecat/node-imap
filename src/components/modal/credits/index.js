import './credits.module.scss';

import { ModalBody, ModalCloseIcon, ModalHeader, ModalSubHeader } from '..';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { AlertContext } from '../../../providers/alert-provider';
import Button from '../../btn';
import CopyButton from '../../copy-to-clipboard';
import { InlineFormInput } from '../../form';
import { Link } from 'gatsby';
import { ModalContext } from '../../../providers/modal-provider';
import ReminderModal from '../reminder';
import { TextImportant } from '../../text';
import { TwitterIcon } from '../../icons';
import { getSocialContent } from './tweets';
import { openTweetIntent } from '../../../utils/tweet';
import request from '../../../utils/request';
import useAsync from 'react-use/lib/useAsync';
import useUser from '../../../utils/hooks/use-user';

async function getRewards() {
  return request('/api/me/milestones');
}

async function getReferrals() {
  return request('/api/me/referrals');
}

async function setTweeted() {
  return request('/api/me/activity', {
    method: 'PATCH',
    body: JSON.stringify({ op: 'add', value: 'tweet' })
  });
}

export default ({ credits }) => {
  const { actions: alertActions } = useContext(AlertContext);
  const [{ unsubCount, loginProvider }] = useUser(u => ({
    unsubCount: u.unsubCount,
    loginProvider: u.loginProvider
  }));
  const { loading, value } = useAsync(getRewards);
  const { loading: referralsLoading, value: referralValue } = useAsync(
    getReferrals
  );

  const referralCode = useMemo(
    () => {
      let referralCode = '';
      if (referralValue) {
        referralCode = referralValue.referralCode;
      }
      return referralCode;
    },
    [referralValue]
  );

  const socialContent = useMemo(
    () => {
      return getSocialContent(unsubCount, referralCode);
    },
    [unsubCount, referralCode]
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
          .credits,
        referredCredits: referrals.find(r => r.name === 'signedUpFromReferral')
          .credits,
        rewards: rewardValues
      };
    },
    [loading, value]
  );

  const [email, setEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  const onClickInvite = useCallback(
    async () => {
      try {
        setSendingInvite(true);
        await sendReferralInvite(email);
        setEmail('');
        alertActions.setAlert({
          id: 'referral-invite-success',
          level: 'success',
          message: `Successfully invited ${email}!`,
          isDismissable: true,
          autoDismiss: true
        });
      } catch (err) {
        alertActions.setAlert({
          id: 'referral-invite-error',
          level: 'error',
          message: `Error inviting ${email}. Please try again or send us a message.`,
          isDismissable: true,
          autoDismiss: true
        });
      } finally {
        setSendingInvite(false);
      }
    },
    [email, alertActions]
  );

  return (
    <div styleName="credits-modal">
      <ModalBody>
        <ModalHeader>
          Credit Balance
          <ModalCloseIcon />
        </ModalHeader>
        <div styleName="balance">
          <p styleName="balance-text">
            Your current credit balance is{' '}
            <span styleName="credit-balance">{credits}</span>.<br />
            You have unsubscribed from a total of{' '}
            <span styleName="credit-balance">{unsubCount}</span> emails.
          </p>

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
        </div>
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
            value={email}
            disabled={sendingInvite}
            onChange={e => setEmail(e.currentTarget.value)}
          >
            <Button
              fill
              basic
              smaller
              inline
              loading={sendingInvite}
              disabled={sendingInvite || !email}
              onClick={onClickInvite}
            >
              Invite
            </Button>
          </InlineFormInput>
          <Button
            muted
            outlined
            stretch
            fill
            basic
            smaller
            inline
            onClick={() => onClickTweet(socialContent.tweet)}
          >
            <TwitterIcon />
            Tweet
          </Button>
          <CopyButton
            string={`${location.host}/r/${referralCode}`}
            muted
            outlined
            stretch
            fill
            basic
            smaller
            inline
          >
            Copy link
          </CopyButton>
        </div>
        {referralsLoading ? null : getReferralList(referralValue)}
        <ModalSubHeader>Other ways to Earn Credit</ModalSubHeader>
        {loading ? null : getRewardList(rewards, socialContent, loginProvider)}
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
        <Link to="/app/profile/security">Secure</Link> your account
      </span>
    )
  },
  setReminder: {
    text: 'Set a reminder',
    description: replaceModal => (
      <span>
        <a onClick={() => replaceModal(<ReminderModal />)}>Set a reminder</a> to
        come back soon
      </span>
    )
  },
  sharedOnTwitter: {
    icon: <TwitterIcon />,
    text: 'Share on Twitter',
    description: tweetText => (
      <span>
        <a onClick={() => onClickTweet(tweetText)}>Tweet about us</a> to your
        followers
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
  const referralsCredits = referrals.reduce((out, r) => out + r.reward, 0);

  return (
    <ul styleName="earn-credit earn-credit-referrals">
      {referredBy ? (
        <li>
          <div styleName="earn-description">
            <span>Signed up from a referral</span>
          </div>
          <div styleName="earn-status">
            <span styleName="earn-amount">{`${
              referredBy.reward
            } credits`}</span>
            <span styleName="earn-checkbox" data-checked="true" />
          </div>
        </li>
      ) : null}
      {referrals.length ? (
        <li>
          <div styleName="earn-description">
            <span>Referred {referrals.length} people</span>
          </div>
          <div styleName="earn-status">
            <span styleName="earn-amount">{`${referralsCredits} credits`}</span>
            <span styleName="earn-checkbox" data-checked="true" />
          </div>
        </li>
      ) : null}
    </ul>
  );
}

function getRewardList(rewards = [], socialContent, loginProvider) {
  const rewardItems = rewards
    .filter(r => {
      const hasReward = rewardLabels[r.name];
      if (r.name === 'addedTwoFactorAuth') {
        return loginProvider === 'password' && hasReward;
      }
      return hasReward;
    })
    .map(r => {
      return {
        ...rewardLabels[r.name],
        reward: r.credits,
        awarded: r.timesCompleted,
        name: r.name
      };
    });
  return <RewardList rewardItems={rewardItems} socialContent={socialContent} />;
}

function RewardList({ rewardItems, socialContent }) {
  const { replace: replaceModal } = useContext(ModalContext);
  return (
    <ul styleName="earn-credit">
      {rewardItems.map(({ text, name, reward, awarded, description }) => {
        let descriptionText;
        if (name === 'setReminder') {
          descriptionText = description(replaceModal);
        } else if (name === 'sharedOnTwitter') {
          descriptionText = description(socialContent.tweet);
        } else {
          descriptionText = description;
        }
        return (
          <li key={name}>
            <div styleName="earn-description">
              <span>{text}</span>
              <span styleName="earn-description-text">{descriptionText}</span>
            </div>
            <div styleName="earn-status">
              <span styleName="earn-amount">{`${reward} credits`}</span>
              <span styleName="earn-checkbox" data-checked={awarded > 0} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function onClickTweet(tweetText) {
  try {
    openTweetIntent(tweetText);
    setTimeout(() => {
      setTweeted();
    }, 1000);
  } catch (err) {
    console.error(err);
  }
}

function sendReferralInvite(email) {
  return request(`/api/me/invite`, {
    method: 'POST',

    body: JSON.stringify({ email })
  });
}
