import { ModalBody, ModalHeader, ModalWizardActions } from '..';
import OnboardingReducer, { initialState } from './reducer';
import React, { useEffect, useMemo, useReducer } from 'react';

import ConnectAccounts from './connect-accounts';
import { TextImportant } from '../../text';
import { Transition } from 'react-transition-group';
import _capitalize from 'lodash.capitalize';
import cx from 'classnames';
import request from '../../../utils/request';
import styles from './onboarding.module.scss';
import unsubscribeGif from '../../../assets/unsub-btn.gif';
import unsubscribeSpamImage from '../../../assets/example-spam-2.png';
import useUser from '../../../utils/hooks/use-user';

export default () => {
  const [state, dispatch] = useReducer(OnboardingReducer, initialState);
  const [
    { accounts, organisationId, isBeta },
    { setMilestoneCompleted }
  ] = useUser(u => ({
    accounts: u.accounts,
    organisationId: u.organisationId,
    isBeta: u.isBeta
  }));

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
        <Content step={state.step} accounts={accounts} isBeta={isBeta} />
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
    </div>
  );
};

function Content({ step, accounts, isBeta }) {
  const content = useMemo(
    () => {
      if (step === 'welcome') {
        return (
          <>
            <ModalHeader>Welcome to Leave Me Alone!</ModalHeader>
            <p>
              <strong>Leave Me Alone</strong> connects to your email inboxes and
              scans for all your subscription mail. We'll show you which mail is
              the most spammy and you can unsubscribe from it easily!
            </p>
            <img
              styleName="onboarding-example-img"
              src={unsubscribeSpamImage}
              alt="example-image"
            />
            <p>
              Let's start by{' '}
              <TextImportant>connecting your email account</TextImportant>.
            </p>
          </>
        );
      }
      if (step === 'accounts') {
        return (
          <>
            <ModalHeader>Connect account</ModalHeader>
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
          <>
            <ModalHeader>Credits</ModalHeader>
            <p>
              <TextImportant>1 credit = 1 unsubscribe.</TextImportant>
            </p>
            <p>
              Each time you unsubscribe from a mailing list it will cost 1
              credit.
            </p>
            {isBeta ? (
              <p>
                To say thanks for joining us during our beta period here are{' '}
                <TextImportant>100 free credits</TextImportant> to get you
                started!
              </p>
            ) : (
              <p>
                Here are <TextImportant>10 free credits</TextImportant> to get
                you started!
              </p>
            )}

            <p>
              More credits can be purchased or earned for free if you run out.
            </p>
          </>
        );
      }
      if (step === 'finish') {
        return (
          <>
            <ModalHeader>Let's start unsubscribing!</ModalHeader>
            <p>
              On the next screen you will see all the mail you are subscribed
              to, just hit the toggle to unsubscribe!
            </p>
            <div styleName="animations">
              <img src={unsubscribeGif} alt="tutorial animation" />
            </div>
            {/* <img src={heartGif} alt="tutorial animation" /> */}
          </>
        );
      }
    },
    [step, accounts]
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
