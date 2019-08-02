import { ModalBody, ModalHeader, ModalWizardActions } from '..';
import OnboardingReducer, { initialState } from './reducer';
import React, { useEffect, useMemo, useReducer } from 'react';
import { TextImportant, TextLink } from '../../text';

import ConnectAccounts from './connect-accounts';
import { Transition } from 'react-transition-group';
import _capitalize from 'lodash.capitalize';
import cx from 'classnames';
import logoV2 from '../../../assets/logo-v2.png';
import { openChat } from '../../../utils/chat';
import request from '../../../utils/request';
import styles from './onboarding.module.scss';
import unsubscribeGif from '../../../assets/unsub-btn.gif';
import unsubscribeSpamImage from '../../../assets/example-spam-2.png';
import useAsync from 'react-use/lib/useAsync';
import useUser from '../../../utils/hooks/use-user';

export default () => {
  const [state, dispatch] = useReducer(OnboardingReducer, initialState);
  const [
    { accounts, organisationId, organisation, isBeta, isMigrated },
    { setMilestoneCompleted }
  ] = useUser(u => ({
    accounts: u.accounts,
    organisationId: u.organisationId,
    organisation: u.organisation,
    isBeta: u.isBeta,
    isMigrated: u.__migratedFrom
  }));

  const { value: startingCredits } = useAsync(() =>
    getMilestoneConnectedFirstAccount()
  );
  useEffect(
    () => {
      dispatch({ type: 'set-starting-credits', data: startingCredits });
    },
    [startingCredits]
  );

  useEffect(
    () => {
      if (state.step === 'accounts') {
        dispatch({ type: 'can-proceed', data: !!accounts.length });
      } else {
        dispatch({ type: 'can-proceed', data: true });
      }
    },
    [state.step, accounts.length]
  );

  useEffect(
    () => {
      dispatch({ type: 'organisation-member', data: !!organisationId });
    },
    [organisationId]
  );

  const onComplete = async () => {
    try {
      setMilestoneCompleted('completedOnboarding');
      updateMilestone('completedOnboarding');
      return false;
    } catch (err) {
      console.error('failed to complete onboarding');
    }
  };

  return (
    <div styleName="onboarding-modal">
      <ModalBody>
        <Content
          step={state.step}
          accounts={accounts}
          isBeta={isBeta}
          isMigrated={isMigrated}
          organisation={organisation}
          positionLabel={state.positionLabel}
          startingCredits={state.startingCredits}
        />
      </ModalBody>
      <ModalWizardActions
        nextLabel={state.nextLabel}
        onNext={() => {
          if (state.step === 'finish') {
            return onComplete();
          }
          return dispatch({ type: 'next-step' });
        }}
        onBack={() => dispatch({ type: 'prev-step' })}
        isLoading={state.isLoading}
        isNextDisabled={!state.canProceed}
        showBack={state.step !== 'welcome'}
      />
      <img styleName="preload" src={unsubscribeSpamImage} />
      <img styleName="preload" src={unsubscribeGif} />
      <img styleName="preload" src={logoV2} />
    </div>
  );
};

function Content({
  step,
  positionLabel,
  accounts,
  isBeta,
  isMigrated,
  organisation = {},
  startingCredits
}) {
  const content = useMemo(
    () => {
      if (step === 'welcome') {
        return (
          <WelcomeContent
            isMigrated={isMigrated}
            positionLabel={positionLabel}
          />
        );
      }
      if (step === 'accounts') {
        return (
          <>
            <ModalHeader>
              Connect account{' '}
              <span styleName="onboarding-position">{positionLabel}</span>
            </ModalHeader>
            <ConnectAccounts accounts={accounts} onboarding />
            {accounts.length ? (
              <p style={{ marginTop: '2em' }}>
                If you have more accounts then you can connect them later.
              </p>
            ) : null}
          </>
        );
      }
      if (step === 'rewards') {
        return (
          <RewardsContent
            positionLabel={positionLabel}
            isBeta={isBeta}
            isMigrated={isMigrated}
            startingCredits={startingCredits}
          />
        );
      }
      if (step === 'organisation') {
        return (
          <>
            <ModalHeader>
              Organisation{' '}
              <span styleName="onboarding-position">{positionLabel}</span>
            </ModalHeader>
            <p>
              You have joined the{' '}
              <TextImportant>{organisation.name} organisation</TextImportant>!
            </p>
            <p>
              As a member of {organisation.name} you can unsubscribe from as
              many unwanted subscription emails as you like.
            </p>
          </>
        );
      }
      if (step === 'finish') {
        return (
          <FinishContent
            positionLabel={positionLabel}
            isMigrated={isMigrated}
          />
        );
      }
    },
    [step, isMigrated, positionLabel, accounts, isBeta, organisation.name]
  );

  return (
    <Transition appear timeout={200} mountOnEnter unmountOnExit in={true}>
      {state => {
        const s = _capitalize(state);
        const hasStyle = !!styles[`wizardContentWrapper${s}`];
        const classes = cx(styles['wizardContentWrapper'], {
          [styles[`wizardContentWrapper${s}`]]: hasStyle
        });
        return (
          <div key={step} className={classes}>
            {content}
          </div>
        );
      }}
    </Transition>
  );
}

function WelcomeContent({ isMigrated, positionLabel }) {
  if (isMigrated) {
    return (
      <>
        <ModalHeader>
          Welcome to Leave Me Alone v2!{' '}
          <span styleName="onboarding-position">{positionLabel}</span>
        </ModalHeader>
        <img
          styleName="v2-logo-img"
          src={logoV2}
          alt="Leave Me Alone logo version 2"
        />
        <p>
          We have added lots of features to make unsubscribing easier and faster
          than before:
        </p>
        <ul styleName="feature-list">
          <li>
            <TextImportant>Connect multiple email accounts</TextImportant> and
            scan them all at once
          </li>
          <li>
            <TextImportant>Improved mail list</TextImportant> with sorting,
            filtering, and pagination
          </li>
          <li>
            <TextImportant>Password login + 2FA</TextImportant> for better
            privacy & increased security
          </li>
          <li>
            <TextImportant>Credit-based pricing</TextImportant> to only pay for
            what you unsubscribe from
          </li>
          <li>
            <TextImportant>Subscriber Score</TextImportant> showing you a brand
            new ranking for senders
          </li>
        </ul>
        <p>
          If you have previously used Leave Me Alone with multiple email
          addresses and would like us to merge them into a single account please{' '}
          <TextLink onClick={() => openChat()}>let us know</TextLink>!
        </p>
      </>
    );
  }

  return (
    <>
      <ModalHeader>
        Welcome to Leave Me Alone!{' '}
        <span styleName="onboarding-position">{positionLabel}</span>
      </ModalHeader>
      <p>
        <strong>Leave Me Alone</strong> connects to your email inboxes and scans
        for all your subscription mail so that you can unsubscribe easily! We'll
        periodically check for new emails so that we stay up-to-date with your
        inbox.
      </p>
      <img
        styleName="onboarding-example-img"
        src={unsubscribeSpamImage}
        alt="Example mail item which can be unsubscribed from"
      />
      <p>
        Let's start by{' '}
        <TextImportant>connecting your email account</TextImportant>.
      </p>
    </>
  );
}

function RewardsContent({
  positionLabel,
  isBeta,
  isMigrated,
  startingCredits
}) {
  if (isMigrated) {
    return (
      <>
        <ModalHeader>
          Credits <span styleName="onboarding-position">{positionLabel}</span>
        </ModalHeader>
        <p>
          We have moved to{' '}
          <TextImportant>
            credit-based pricing and charge a small amount for each unsubscribe
          </TextImportant>
          . We show your subscription emails immediately and periodically check
          for new emails so that{' '}
          <TextImportant>we stay up-to-date</TextImportant> with your inbox.
        </p>
        <p styleName="credit-text">
          <TextImportant>1 credit = 1 unsubscribe</TextImportant>
        </p>
        <p>
          To say thanks for being a loyal customer here are{' '}
          <TextImportant>{startingCredits} free credits</TextImportant> to get
          you started!
        </p>
        <p>More credits can be purchased or earned for free if you run out.</p>
      </>
    );
  }

  return (
    <>
      <ModalHeader>
        Credits <span styleName="onboarding-position">{positionLabel}</span>
      </ModalHeader>
      <p styleName="credit-text">
        <TextImportant>1 credit = 1 unsubscribe</TextImportant>
      </p>
      <p>
        Each time you unsubscribe from a mailing list it will cost 1 credit.
      </p>
      {isBeta ? (
        <p>
          To say thanks for joining us during our beta period here are{' '}
          <TextImportant>{startingCredits} free credits</TextImportant> to get
          you started!
        </p>
      ) : (
        <p>
          Here are <TextImportant>{startingCredits} free credits</TextImportant>{' '}
          to get you started!
        </p>
      )}

      <p>More credits can be purchased or earned for free if you run out.</p>
    </>
  );
}

function FinishContent({ positionLabel, isMigrated }) {
  return (
    <>
      <ModalHeader>
        Let's start unsubscribing!{' '}
        <span styleName="onboarding-position">{positionLabel}</span>
      </ModalHeader>
      {isMigrated ? (
        <>
          <p>You're almost ready to use the new and improved mail list.</p>
          <p>
            The basics haven't changed - just hit the toggle to unsubscribe!
          </p>
        </>
      ) : (
        <p>
          On the next screen you will see all the mail you are subscribed to,
          just hit the toggle to unsubscribe!
        </p>
      )}
      <div styleName="animations">
        <img
          src={unsubscribeGif}
          alt="tutorial animation showing the unsubscribe button clicked"
        />
      </div>
    </>
  );
}

export async function updateMilestone(milestone) {
  return request('/api/me/milestones', {
    method: 'PATCH',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ op: 'update', value: milestone })
  });
}

async function getMilestoneConnectedFirstAccount() {
  try {
    const { credits } = await request(`/api/milestones/connectedFirstAccount`);
    return credits;
  } catch (err) {
    return 10;
  }
}
