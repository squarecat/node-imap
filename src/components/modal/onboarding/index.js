import Modal, { ModalBody, ModalWizardActions } from '..';
import OnboardingReducer, { initialState } from './reducer';
import React, { useEffect, useReducer } from 'react';
import { TextImportant, TextLead } from '../../text';

import ConnectAccounts from './connect-accounts';
import { Gift as GiftIcon } from '../../icons';
import { Transition } from 'react-transition-group';
import _capitalize from 'lodash.capitalize';
import cx from 'classnames';
import heartGif from '../../../assets/heart.gif';
import request from '../../../utils/request';
import styles from './onboarding.module.scss';
import unsubscribeGif from '../../../assets/unsub-btn.gif';
import unsubscribeSpamImage from '../../../assets/example-spam-2.png';
import useUser from '../../../utils/hooks/use-user';

export default ({ shown, onClose }) => {
  const [state, dispatch] = useReducer(OnboardingReducer, initialState);
  const [accounts, { setMilestoneCompleted }] = useUser(u => u.accounts);
  useEffect(
    () => {
      if (state.step === 'accounts') {
        dispatch({ type: 'can-proceed', data: !!accounts.length });
      }
    },
    [state.step, accounts.length]
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
    <Modal
      shown={shown}
      onClose={onClose}
      dismissable={false}
      style={{ width: 650 }}
      wizardComponent={
        <ModalWizardActions
          isLoading={state.isLoading}
          isNextDisabled={!state.canProceed}
          showBack={false}
          nextLabel={state.nextLabel}
          onNext={() => {
            if (state.step === 'finish') {
              return onComplete();
            }
            return dispatch({ type: 'next-step' });
          }}
          onBack={() => dispatch({ type: 'prev-step' })}
          onCancel={() => {}}
        />
      }
    >
      <ModalBody>
        <Content step={state.step} accounts={accounts} />
      </ModalBody>
    </Modal>
  );
};

function Content({ step, accounts }) {
  let content = null;
  if (step === 'welcome') {
    content = (
      <>
        <h2>Welcome to Leave Me Alone!</h2>
        <TextLead prose> Let's get started</TextLead>
        <p>
          <strong>Leave Me Alone</strong> connects to your email inboxes and
          scans for all your subscription mail. We'll show you which mail is the
          most spammy and you can unsubscribe from it easily!
        </p>
        <img
          styleName="onboarding-example-img"
          src={unsubscribeSpamImage}
          alt="example-image"
        />
        <p>
          Let's start by{' '}
          <TextImportant>connecting some of your email accounts</TextImportant>.
        </p>
      </>
    );
  }
  if (step === 'accounts') {
    content = (
      <>
        <h2>Connect email accounts</h2>
        <ConnectAccounts accounts={accounts} />
      </>
    );
  }
  if (step === 'rewards') {
    content = (
      <div style={{ textAlign: 'center' }}>
        <h2>Earn credits.</h2>
        <p>
          {/* You can purchase different sized packages of credits for
          unsubscribing.
          <br /> */}
          <TextImportant>1 credit = 1 unsubscribe</TextImportant>.
        </p>
        <p>
          <span style={{ paddingTop: '30px', height: 100 }}>
            Spot this icon to <TextImportant>earn FREE credits</TextImportant>!
          </span>
        </p>
        <p styleName="text-column">
          <GiftIcon height={90} width={100} />
        </p>

        <p style={{ marginTop: -20 }}>
          Here are <TextImportant>10 free credits</TextImportant> to get you
          started!
        </p>
      </div>
    );
  }
  if (step === 'finish') {
    content = (
      <>
        <h2>Start unsubscribing!</h2>
        <p>
          From here on we'll show you all the mail you are subscribed to, just
          hit the slider to unsubscribe, or the heart to keep.
        </p>
        <div styleName="animations">
          <img src={unsubscribeGif} alt="tutorial animation" />
          <img src={heartGif} alt="tutorial animation" />
        </div>
      </>
    );
  }
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
