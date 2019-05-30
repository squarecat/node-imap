import 'isomorphic-fetch';

import React, { useState } from 'react';

import MailList from '../../app/mail-list';
import OnboardingModal from '../../components/modal/onboarding';
import Template from '../../app/template';
import { Transition } from 'react-transition-group';
import useUser from '../../utils/hooks/use-user';

function Content() {
  const [user] = useUser();
  const { hasCompletedOnboarding } = user;

  const [showOnboardingModal, toggleOnboardingModal] = useState(
    !hasCompletedOnboarding
  );
  return (
    <>
      <OnboardingModal
        shown={showOnboardingModal}
        onClose={() => toggleOnboardingModal(false)}
      />
      <Transition
        in={true}
        classNames="mail-list-content"
        timeout={250}
        mountOnEnter
        appear
      >
        {state => (
          <div className={`mail-list-content ${state}`}>
            <MailList />
          </div>
        )}
      </Transition>
    </>
  );
}

export default function App() {
  return (
    <Template>
      <Content />
    </Template>
  );
}
