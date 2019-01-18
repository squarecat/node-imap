import React, { useState } from 'react';
import 'isomorphic-fetch';
import { Transition } from 'react-transition-group';

import Template from './template';
import Modal from '../../components/price-modal';

import useUser from '../../utils/hooks/use-user';

import MailList from './mail-list';
import Welcome from './welcome';

import './index.css';

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
  const [showPriceModal, togglePriceModal] = useState(false);
  const [timeframe, setTimeframe] = useState(doScan || rescan);
  const [user, { setLastPaidScan }] = useUser();
  const { hasScanned } = user;

  return (
    <Template>
      <Transition
        in={!hasScanned && !timeframe}
        classNames="welcome-content"
        timeout={250}
        unmountOnExit
      >
        {state => (
          <div className={`welcome-content ${state}`}>
            <Welcome openPriceModal={() => togglePriceModal(true)} />
          </div>
        )}
      </Transition>

      <Transition
        in={!!(hasScanned || timeframe)}
        classNames="mail-list-content"
        timeout={250}
        mountOnEnter
        appear
      >
        {state => (
          <div className={`mail-list-content ${state}`}>
            <MailList
              timeframe={timeframe}
              hasSearched={hasScanned}
              showPriceModal={() => togglePriceModal(true)}
            />
          </div>
        )}
      </Transition>

      {showPriceModal ? (
        <Modal
          onPurchase={option => {
            setTimeframe(option);
            if (option !== '3d') {
              setLastPaidScan(option);
            }
            togglePriceModal(false);
          }}
          onClose={() => togglePriceModal(false)}
        />
      ) : null}
    </Template>
  );
}
