import { InviteForm, InviteLink } from '../../form/invite';
import { ModalBody, ModalHeader, ModalWizardActions } from '..';
import OrgOnboardingReducer, { initialState } from './reducer';
import React, { useMemo, useReducer } from 'react';

import ConnectAccounts from '../onboarding/connect-accounts';
import { TextImportant } from '../../text';
import { Transition } from 'react-transition-group';
import _capitalize from 'lodash.capitalize';
import cx from 'classnames';
import { navigate } from 'gatsby';
import request from '../../../utils/request';
import styles from './organisation-onboarding.module.scss';
import unsubscribeSpamImage from '../../../assets/example-spam-2.png';
import useUser from '../../../utils/hooks/use-user';

export default () => {
  const [state, dispatch] = useReducer(OrgOnboardingReducer, initialState);
  const [
    { accounts, isBeta, organisationId, organisation },
    { setMilestoneCompleted }
  ] = useUser(u => ({
    accounts: u.accounts,
    isBeta: u.isBeta,
    organisationId: u.organisationId,
    organisation: u.organisation
  }));

  const onComplete = async () => {
    try {
      setMilestoneCompleted('completedOnboardingOrganisation');
      await updateMilestone('completedOnboardingOrganisation');
      navigate('/app/profile/team');
      return false;
    } catch (err) {
      console.error('failed to complete onboarding team');
    }
  };

  return (
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
          onInvite={email => {
            dispatch({ type: 'add-invited-user', data: email });
          }}
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
        showBack={state.step !== 'welcome'}
      />
      <img styleName="preload" src={unsubscribeSpamImage} />
    </div>
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
  const content = useMemo(
    () => {
      if (step === 'welcome') {
        return (
          <>
            <ModalHeader>
              Welcome to Leave Me Alone for Teams!{' '}
              <span styleName="onboarding-position">{positionLabel}</span>
            </ModalHeader>
            <p>
              <strong>Leave Me Alone</strong> makes it quick and easy to
              unsubscribe from unwanted spam so that your team can focus on
              building your business.
            </p>
            <p>
              Members of the {organisation.name} team can unsubscribe from as
              many emails as they like.
            </p>
            <img
              styleName="onboarding-example-img"
              src={unsubscribeSpamImage}
              alt="example-image"
            />
            <p>Let's get started!</p>
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
            {organisation.allowAnyUserWithCompanyEmail ? (
              <>
                <p>
                  Any user with your company domain can join. Instead of
                  inviting them all, you can share this link:
                </p>
                <InviteLink code={organisation.inviteCode} />
                <span styleName="separator" />
              </>
            ) : null}
            <p>
              You can invite anyone inside or outside your company by email
              address:
            </p>
            <InviteForm organisationId={organisationId} onSuccess={onInvite} />
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
            <p>If you want to invite more people you can do so later.</p>
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
                activated your team for free!
              </p>
              <p>We'll now take you to your team management page.</p>
            </>
          );
        }
        if (organisation.active) {
          finishContent = (
            <>
              <p>
                Your team has been activated! Members can start unsubscribing
                and saving time right away.
              </p>
              <p>We'll now take you to your team management page.</p>
            </>
          );
        } else {
          finishContent = (
            <>
              <p>
                Before your team at {organisation.name} can start unsubscribing
                you need to <TextImportant>activate your team</TextImportant> by
                adding a payment method.
              </p>
              <p>We'll now take you to your team management page to do this.</p>
            </>
          );
        }
        return (
          <>
            <ModalHeader>
              Activate your team{' '}
              <span styleName="onboarding-position">{positionLabel}</span>
            </ModalHeader>
            <p>
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
    },
    [
      step,
      accounts,
      onInvite,
      isBeta,
      positionLabel,
      organisation,
      organisationId,
      invitedUsersCount
    ]
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
