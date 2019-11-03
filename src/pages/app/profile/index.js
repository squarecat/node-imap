import './profile.module.scss';

import { GoogleIcon, KeyIcon, MicrosoftIcon } from '../../../components/icons';
import React, { useCallback, useContext, useState, useMemo } from 'react';
import { TextImportant, TextLink } from '../../../components/text';
import { TwitterIcon, Arrow as ArrowIcon } from '../../../components/icons';

import { AlertContext } from '../../../providers/alert-provider';
import Button from '../../../components/btn';
import { DatabaseContext } from '../../../providers/db-provider';
import { ModalContext } from '../../../providers/modal-provider';
import ProfileLayout from '../../../app/profile/layout';
import WarningModal from '../../../components/modal/warning-modal';
import { getBasicError } from '../../../utils/errors';
import { openChat } from '../../../utils/chat';
import request from '../../../utils/request';
import useUser from '../../../utils/hooks/use-user';
import {
  CARBON_PER_EMAIL,
  formatWeight,
  formatNumber
} from '../../../utils/climate-stats';
import broomImg from '../../../assets/enterprise/broom.png';
import rewardsImg from '../../../assets/onboarding/reward.png';
import treeImg from '../../../assets/climate/tree.png';
import envelopeImg from '../../../assets/open-envelope-love.png';
import { openTweetIntent } from '../../../utils/tweet';
import { Link } from 'gatsby';
import useAsync from 'react-use/lib/useAsync';

function Profile() {
  return (
    <ProfileLayout pageName="Profile">
      <ProfilePage />
    </ProfileLayout>
  );
}

export default Profile;

const ProfilePage = () => {
  const [
    { email, unsubCount, organisationAdmin, loginProvider, organisation }
  ] = useUser(u => ({
    email: u.email,
    organisationAdmin: u.organisationAdmin,
    loginProvider: u.loginProvider,
    unsubCount: u.unsubCount,
    organisation: u.organisation
  }));
  return (
    <>
      <div styleName="section">
        <h2>Details</h2>

        <p styleName="email-container">
          <span>Signed in with: </span>
          <ProviderIcon loginProvider={loginProvider} />
          <span styleName="email">
            <TextImportant>{email}</TextImportant>
          </span>
        </p>
        {/* <p>
          You have unsubscribed from a total of{' '}
          <TextImportant>{unsubCount}</TextImportant> emails.
        </p> */}
      </div>

      <Stats />

      <DangerZone
        organisationAdmin={organisationAdmin}
        organisation={organisation}
      />
    </>
  );
};

const DangerZone = React.memo(({ organisationAdmin, organisation }) => {
  const [loading, toggleLoading] = useState(false);

  const { open: openModal } = useContext(ModalContext);
  const db = useContext(DatabaseContext);
  const { actions: alertActions } = useContext(AlertContext);

  const onClickClear = useCallback(() => {
    function onConfirm() {
      db.clear();
      alertActions.setAlert({
        id: 'deactivate-account-success',
        level: 'success',
        message: `Your local email data has been cleared!`,
        isDismissable: true,
        autoDismiss: true
      });
    }
    openModal(
      <WarningModal
        onConfirm={onConfirm}
        content={
          <>
            <p>
              <TextImportant>WARNING:</TextImportant> this will remove all of
              the local email data that you see on the mail page. Re-scanning
              will automatically take place when you return to that page but may
              take a few minutes.
            </p>
            <p>
              If you continue to have problems after this then please contact
              support.
            </p>
          </>
        }
        confirmText="Confirm"
      />,
      {
        dismissable: true
      }
    );
  }, [openModal, db, alertActions]);

  const onClickDelete = useCallback(() => {
    const deactivateUserAccount = async () => {
      try {
        toggleLoading(true);
        await db.clear();
        await deactivateAccount();
        setTimeout(() => {
          window.location.href = '/goodbye';
        }, 300);
      } catch (err) {
        toggleLoading(false);
        const message = getBasicError(err);
        alertActions.setAlert({
          id: 'deactivate-account-error',
          level: 'error',
          message,
          isDismissable: true,
          autoDismiss: false
        });
      }
    };
    openModal(
      <WarningModal
        onConfirm={() => deactivateUserAccount()}
        content={
          <>
            <p>
              <TextImportant>WARNING:</TextImportant>
              This will delete <TextImportant>
                ALL OF YOUR DATA
              </TextImportant>{' '}
              including your account details, scan history, favorite senders,
              reminders, and referral data.
            </p>
            <p>
              However, you are not tied to our service in any way. Any mailing
              lists you unsubscribed from are gone forever.
            </p>
          </>
        }
        confirmText="Yes delete everything"
      />,
      {
        dismissable: true
      }
    );
  }, [openModal, db, alertActions]);

  return (
    <>
      <div styleName="section">
        <h2 styleName="danger-zone-title">Danger Zone</h2>

        <h2>Clear Local Data</h2>
        <p>
          We do not store any of your emails, everything is stored in your
          browser. If you are having problems with a scan you can try clearing
          this data.
        </p>
        <Button compact basic onClick={() => onClickClear()}>
          Clear Local Emails
        </Button>

        <span styleName="separator" />

        <h2>Deactivate Account</h2>
        <p styleName="warning">
          We NEVER store the content of your emails in any form.
        </p>
        <p>
          We do store metadata of your emails in order to identify if you have
          unsubscribed from a subscription in a previous scan. This is limited
          to recipient and sender email addresses, and a timestamp, and is
          encrypted.
        </p>

        {organisationAdmin ? (
          <TextImportant>
            You are an admin of the {organisation.name} team. If you wish to
            deactivate your account please{' '}
            <TextLink onClick={() => openChat()}>contact us</TextLink>.
          </TextImportant>
        ) : (
          <>
            <p>
              If you still want to delete your account this action will delete
              all of your data, revoke your API key, and sign you out.
            </p>
            <Button
              compact
              basic
              loading={loading}
              onClick={() => onClickDelete()}
            >
              Deactivate Account
            </Button>
          </>
        )}
      </div>
    </>
  );
});

async function deactivateAccount() {
  try {
    return request('/api/me', {
      credentials: 'same-origin',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

const Stats = React.memo(() => {
  const [{ unsubCount, creditsEarned, accountsCount, referralCode }] = useUser(
    u => ({
      unsubCount: u.unsubCount,
      creditsEarned: u.creditsEarned,
      accountsCount: u.accounts.length,
      referralCode: u.referralCode
    })
  );

  const { loading: milestoneLoading, value: milestoneValue } = useAsync(
    getMilestone
  );

  const referralContent = useMemo(() => {
    if (milestoneLoading) return null;
    return (
      <p styleName="helper">
        Each friend that signs up via your referral link will earn you{' '}
        {milestoneValue.credits} extra credits
      </p>
    );
  }, [milestoneLoading, milestoneValue]);

  const carbonSaved = useMemo(
    () => formatWeight(unsubCount * CARBON_PER_EMAIL),
    [unsubCount]
  );

  const onClickTweet = useCallback(() => {
    const tweetText = `My unsubscribing achievements on @LeaveMeAloneApp:‍%0a
💌 ${unsubCount} mailing lists unsubscribed from%0a
🧹 ${accountsCount} email addresses cleaned%0a
💰 ${creditsEarned} free credits earned%0a
🌳 ${carbonSaved} CO2 saved%0a
%0a
Join me and get 5 extra unsubscribe credits for free! 🙌leavemealone.app/r/${referralCode}`;
    try {
      openTweetIntent(tweetText);
      setTimeout(() => {
        setTweeted();
      }, 5000);
    } catch (err) {
      console.error(err);
    }
  }, [accountsCount, carbonSaved, creditsEarned, referralCode, unsubCount]);

  const content = useMemo(() => {
    if (unsubCount <= 0) {
      return (
        <>
          <p>You haven't unsubscribed from any mailing lists yet.</p>
          <p>
            <Link to="/app">
              Start cleaning your inboxes to see your achievements here!{' '}
              <ArrowIcon inline width="14" height="14" />
            </Link>
          </p>
        </>
      );
    }
    return (
      <>
        <p>
          Congratulations, this is really awesome! Don't forget to come back to
          keep your mailboxes clutter free.
        </p>
        <div styleName="boxes">
          <div styleName="box">
            <div styleName="box-img">
              <img src={envelopeImg} alt="envelope with a heart image" />
            </div>
            <span styleName="box-value">{formatNumber(unsubCount)}</span>
            <span styleName="box-label">Mailing lists unsubscribed from</span>
          </div>
          <div styleName="box">
            <div styleName="box-img">
              <img alt="two coins falling into a hand image" src={rewardsImg} />
            </div>
            <span styleName="box-value">{formatNumber(creditsEarned)}</span>
            <span styleName="box-label">Free credits earned</span>
          </div>
          <div styleName="box">
            <div styleName="box-img">
              <img alt="deciduous tree in a cloud" src={treeImg} />
            </div>
            <span styleName="box-value">{carbonSaved}</span>
            <span styleName="box-label">
              <span>
                CO<sub>2</sub>
              </span>{' '}
              saved
            </span>
          </div>
          <div styleName="box">
            <div styleName="box-img">
              <img alt="broom sweeping image" src={broomImg} />
            </div>
            <span styleName="box-value">{accountsCount}</span>
            <span styleName="box-label">Email addresses cleaned</span>
          </div>
        </div>

        <Button compact basic long onClick={onClickTweet}>
          <TwitterIcon width="16" height="16" /> Share with your friends!
        </Button>
        {referralContent}
      </>
    );
  }, [
    accountsCount,
    carbonSaved,
    creditsEarned,
    onClickTweet,
    referralContent,
    unsubCount
  ]);

  return (
    <div styleName="section">
      <h2>Achievements</h2>
      {content}
    </div>
  );
});

const ProviderIcon = React.memo(({ loginProvider }) => {
  if (loginProvider === 'password')
    return <KeyIcon inline width="16" height="16" style={{ top: '-1px' }} />;
  if (loginProvider === 'google') return <GoogleIcon width="16" height="16" />;
  if (loginProvider === 'outlook')
    return <MicrosoftIcon width="16" height="16" />;
});

async function setTweeted() {
  return request('/api/me/activity', {
    method: 'PATCH',
    body: JSON.stringify({ op: 'add', value: 'tweet' })
  });
}

async function getMilestone() {
  return request('/api/milestones/referralSignUp');
}
