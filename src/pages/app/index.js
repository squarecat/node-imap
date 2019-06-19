import 'isomorphic-fetch';

import React, { useContext, useEffect, useState } from 'react';

import MailList from '../../app/mail-list';
import { ModalContext } from '../../providers/modal-provider';
import OnboardingModal from '../../components/modal/onboarding';
import Template from '../../app/template';
import { Transition } from 'react-transition-group';
import useUser from '../../utils/hooks/use-user';

if (process.env.NODE_ENV !== 'production') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React);
}

function Content() {
  const [hasCompletedOnboarding] = useUser(u => u.hasCompletedOnboarding);
  const { open: openModal } = useContext(ModalContext);

  useEffect(
    () => {
      if (!hasCompletedOnboarding) {
        openModal(<OnboardingModal />, {
          dismissable: false
        });
      }
    },
    [hasCompletedOnboarding, openModal]
  );

  return (
    <>
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
