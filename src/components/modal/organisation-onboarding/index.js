import { ModalBody, ModalHeader, ModalWizardActions } from '..';
import OrgOnboardingReducer, { initialState } from './reducer';
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer
} from 'react';

import ConnectAccounts from '../onboarding/connect-accounts';
import OrganisationSetup from './setup';
import { TextImportant } from '../../text';
import { Transition } from 'react-transition-group';
import _capitalize from 'lodash.capitalize';
import cx from 'classnames';
import { navigate } from 'gatsby';
import request from '../../../utils/request';
import styles from './organisation-onboarding.module.scss';
import unsubscribeSpamImage from '../../../assets/example-spam-2.png';
import setupImg from '../../../assets/onboarding/create.png';
import inviteImg from '../../../assets/onboarding/party.png';
import accountsImg from '../../../assets/onboarding/workflow.png';
import doneImg from '../../../assets/onboarding/checklist.png';
import useUser from '../../../utils/hooks/use-user';
import TeamInvite from '../../form/team-invite';

export const OnboardingContext = createContext({ state: initialState });

export default () => {
  const [
    { accounts, isBeta, email, organisationId, organisation },
    { setMilestoneCompleted, setOrganisation }
  ] = useUser(u => ({
    accounts: u.accounts,
    isBeta: u.isBeta,
    email: u.email,
    organisationId: u.organisationId,
    organisation: u.organisation
  }));

  const [state, dispatch] = useReducer(OrgOnboardingReducer, {
    ...initialState,
    organisation: {
      ...initialState.organisation,
      adminUserEmail: email,
      ...organisation
    }
  });

  const onComplete = useCallback(async () => {
    try {
      setMilestoneCompleted('completedOnboardingOrganisation');
      await updateMilestone('completedOnboardingOrganisation');
      navigate('/app/profile/team');
      return false;
    } catch (err) {
      console.error('failed to complete onboarding team');
    }
  }, [setMilestoneCompleted]);

  const onSetupTeam = useCallback(async () => {
    try {
      dispatch({ type: 'set-loading', data: true });
      dispatch({ type: 'set-error', data: false });

      const data = state.organisation;

      const response = await createUpdateOrganisation(organisationId, data);
      console.log(response);
      setOrganisation(response);
      console.log('success creating org');
      return dispatch({ type: 'next-step' });
    } catch (err) {
      throw err;
    } finally {
      dispatch({ type: 'set-loading', data: false });
    }
  }, [organisationId, setOrganisation, state.organisation]);

  useEffect(() => {
    if (state.step === 'setup') {
      dispatch({ type: 'can-proceed', data: !!state.organisation.name });
    } else {
      dispatch({ type: 'can-proceed', data: true });
    }
  }, [state.step, state.organisation.name]);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <OnboardingContext.Provider value={value}>
      <div styleName="org-onboarding-modal">
        <ModalBody>
          <Content
            step={state.step}
            positionLabel={state.positionLabel}
            isBeta={isBeta}
            accounts={accounts}
            organisationId={organisationId}
            organisation={organisation}
            invitedUsersCount={state.invitedUsersCount}
            onInvite={() => {
              dispatch({ type: 'add-invited-users', data: 1 });
            }}
          />
        </ModalBody>
        <ModalWizardActions
          nextLabel={state.nextLabel}
          onNext={() => {
            if (state.step === 'setup') {
              return onSetupTeam();
            }
            if (state.step === 'finish') {
              return onComplete();
            }
            return dispatch({ type: 'next-step' });
          }}
          onBack={() => dispatch({ type: 'prev-step' })}
          isLoading={state.loading}
          showBack={state.step !== 'setup'}
          isNextDisabled={!state.canProceed}
        />
        <img styleName="preload" src={unsubscribeSpamImage} />
        <img styleName="preload" src={setupImg} />
        <img styleName="preload" src={inviteImg} />
        <img styleName="preload" src={accountsImg} />
        <img styleName="preload" src={doneImg} />
      </div>
    </OnboardingContext.Provider>
  );
};

function Content({
  step,
  positionLabel,
  isBeta,
  accounts,
  organisationId,
  organisation,
  onInvite,
  invitedUsersCount
}) {
  const content = useMemo(() => {
    if (step === 'setup') {
      return (
        <>
          <ModalHeader>
            Let's set up your Team account
            <span styleName="onboarding-position">{positionLabel}</span>
          </ModalHeader>
          <div styleName="onboarding-img">
            <img alt="paper and pen image" src={setupImg} />
          </div>
          <OrganisationSetup />
        </>
      );
    }
    if (step === 'invite') {
      return (
        <>
          <ModalHeader>
            Invite your team members{' '}
            <span styleName="onboarding-position">{positionLabel}</span>
          </ModalHeader>
          <div styleName="onboarding-img">
            <img alt="cartoon man and woman dancing" src={inviteImg} />
          </div>
          <TeamInvite
            organisation={organisation}
            onSuccess={onInvite}
            multiple={false}
          />
          {invitedUsersCount ? (
            <p>
              You have invited{' '}
              <TextImportant>
                {invitedUsersCount}{' '}
                {invitedUsersCount > 1 ? 'people' : 'person'}
              </TextImportant>{' '}
              to join {organisation.name}!
            </p>
          ) : null}
          <p>If you want to invite more people you can do this later.</p>
        </>
      );
    }
    if (step === 'accounts') {
      return (
        <>
          <ModalHeader>
            Connect your account{' '}
            <span styleName="onboarding-position">{positionLabel}</span>
          </ModalHeader>
          <div styleName="onboarding-img">
            <img alt="flowchart workflow image" src={accountsImg} />
          </div>
          <ConnectAccounts accounts={accounts} onboarding enterprise />
          {accounts.length ? (
            <p style={{ marginTop: '2em' }}>
              If you have more accounts then you can connect them later.
            </p>
          ) : null}
        </>
      );
    }
    if (step === 'finish') {
      let finishContent;
      if (isBeta) {
        finishContent = (
          <>
            <p>
              To say thanks for joining us during our beta period we have
              activated your account for free!
            </p>
            <p>We'll now take you to your team management page.</p>
          </>
        );
      }
      if (organisation.active) {
        finishContent = (
          <>
            <p>
              Your team has been activated! Members can start unsubscribing and
              saving time right away.
            </p>
            <p>We'll now take you to your team management page.</p>
          </>
        );
      } else {
        finishContent = (
          <>
            <p>
              This means that you need to{' '}
              <TextImportant>
                activate your team by adding a payment method
              </TextImportant>{' '}
              before members can start unsubscribing and saving time.
            </p>
            <p>Let's go to your team management page to do this.</p>
          </>
        );
      }
      return (
        <>
          <ModalHeader>
            You are finished!{' '}
            <span styleName="onboarding-position">{positionLabel}</span>
          </ModalHeader>
          <div styleName="onboarding-img">
            <img alt="clipboard with all items checked image" src={doneImg} />
          </div>
          <p>
            {organisation.name} is currently{' '}
            <span
              styleName={cx('org-status', {
                active: organisation.active,
                inactive: !organisation.active
              })}
            >
              {organisation.active ? 'Active' : 'Inactive'}
            </span>
          </p>
          {finishContent}
        </>
      );
    }
  }, [
    step,
    accounts,
    onInvite,
    isBeta,
    positionLabel,
    organisation,
    organisationId,
    invitedUsersCount
  ]);

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

    body: JSON.stringify({ op: 'update', value: milestone })
  });
}

async function createUpdateOrganisation(id, data) {
  if (!id) {
    return request(`/api/organisation`, {
      method: 'POST',
      body: JSON.stringify({ organisation: data })
    });
  }
  return request(`/api/organisation/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ op: 'update', value: data })
  });
}
