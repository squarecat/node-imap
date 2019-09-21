import React, { useCallback } from 'react';
import './onboarding.module.scss';
import { TeamContent, updateMilestone } from '.';
import { ModalBody, ModalWizardActions } from '..';

import useUser from '../../../utils/hooks/use-user';

export default () => {
  const [{ organisationName }, { setMilestoneCompleted }] = useUser(u => ({
    organisationName: u.organisation.name
  }));

  const onComplete = useCallback(async () => {
    try {
      setMilestoneCompleted('completedOnboardingOrganisation');
      await updateMilestone('completedOnboardingOrganisation');
      return false;
    } catch (err) {
      console.error('failed to complete onboarding team member');
    }
  }, [setMilestoneCompleted]);

  return (
    <div styleName="onboarding-modal">
      <ModalBody>
        <TeamContent
          positionLabel={false}
          organisationName={organisationName}
        />
      </ModalBody>
      <ModalWizardActions
        nextLabel="Awesome"
        onNext={() => onComplete()}
        showBack={false}
      />
    </div>
  );
};
