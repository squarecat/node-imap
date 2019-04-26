import 'isomorphic-fetch';

import React, { useState } from 'react';

import MailList from './mail-list';
import OnboardingModal from '../../components/modal/onboarding';
import Template from './template';
import { Transition } from 'react-transition-group';
import useUser from '../../utils/hooks/use-user';

let doScan = false;
if (typeof URLSearchParams !== 'undefined' && typeof window !== 'undefined') {
  doScan = new URLSearchParams(window.location.search).get('doScan');
}
if (doScan) {
  history.replaceState({}, '', window.location.pathname);
}

export default function App({ location = {} } = {}) {
  const { state } = location;
  const rescan = state && state.rescan;

  const [timeframe, setTimeframe] = useState(doScan || rescan);
  const [user, { setLastPaidScanType }] = useUser();
  const { hasScanned } = user;
  const isNewUser = !hasScanned && !timeframe;
  const [showOnboardingModal, toggleOnboardingModal] = useState(isNewUser);

  return (
    <Template onboarding={showOnboardingModal}>
      <OnboardingModal
        shown={showOnboardingModal}
        onClose={() => toggleOnboardingModal(false)}
      />
      {/*
      <Transition
        in={showOnboardingModal}
        classNames="welcome-content"
        timeout={250}
        unmountOnExit
      >
        {state => (
          <div className={`welcome-content ${state}`}>
            <Welcome
              openPriceModal={() => togglePriceModal(true)}
              provider={provider}
            />
          </div>
        )}
      </Transition> */}

      <Transition
        in={true}
        classNames="mail-list-content"
        timeout={250}
        mountOnEnter
        appear
      >
        {state => (
          <div className={`mail-list-content ${state}`}>
            <MailList
              timeframe={timeframe}
              setTimeframe={tf => setTimeframe(tf)}
            />
          </div>
        )}
      </Transition>
    </Template>
  );
}
