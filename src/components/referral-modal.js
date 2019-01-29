import React, { useState, useEffect } from 'react';

import AnimatedNumber from 'react-animated-number';
import useAsync from '../utils/hooks/use-async';
import ModalClose from './modal/modal-close';

import * as track from '../utils/analytics';

async function fetchReferralStats() {
  const response = await fetch('/api/me/referrals');
  return response.json();
}

export default ({ onClose }) => {
  const [isShown, setShown] = useState(false);
  const { value } = useAsync(fetchReferralStats);
  const stats = value || {};
  const handleKeydown = e => {
    if (e.keyCode === 27 || e.key === 'Escape') {
      onClickClose();
    }
  };
  // on mount
  useEffect(() => {
    setShown(true);
    track.trackReferralModalOpen();
    document.addEventListener('keydown', handleKeydown, false);
    return function cleanup() {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const onClickClose = () => {
    setShown(false);
    setTimeout(onClose, 300);
  };
  const onClickCash = () => {};

  return (
    <>
      <div className={`modal referral-modal ${isShown ? 'shown' : ''}`}>
        <ModalClose onClose={onClickClose} />
        <h3>Refer a friend and earn $</h3>
        {content({ ...stats, onClickCash, onClickClose })}
      </div>
      <div className={`modal-bg ${isShown ? 'shown' : ''}`} />
    </>
  );
};

function content({
  referralCode = '...loading',
  referrals = [],
  referralBalance = '0',
  onClickCash,
  onClickClose
}) {
  const signedup = referrals.length;
  const purchased = referrals.filter(r => r.price).length;
  return (
    <>
      <div className="modal-content">
        <p>
          For every 3 people that sign-up using your referral link and make a
          purchase, we will pay you 5 bucks!
        </p>
        <p>Your referral URL is...</p>
        <pre className="referral-code">{`https://leavemealone.xyz/r/${referralCode}`}</pre>
        <div className="referral-balances">
          <div className="referral-box cash-balance">
            <div className="referral-box-title">Balance</div>
            <div className="referral-box-value">
              <AnimatedNumber
                stepPrecision={0}
                value={referralBalance ? referralBalance / 100 : 0}
                formatValue={n => `$${n}`}
                duration={250}
              />
            </div>
          </div>
          <div className="referral-box friends-signedup">
            <div className="referral-box-title">Sign ups</div>
            <div className="referral-box-value">
              <AnimatedNumber
                stepPrecision={0}
                value={signedup}
                duration={250}
              />
            </div>
          </div>
          <div className="referral-box friends-purchased">
            <div className="referral-box-title">Purchases</div>
            <div className="referral-box-value">
              <AnimatedNumber
                stepPrecision={0}
                value={purchased}
                duration={250}
              />
            </div>
          </div>
        </div>
        <ul className="referral-reasons">
          <li>
            ✔ Increase your{' '}
            <span className="text-important">team's productivity</span>.
          </li>
          <li>
            ✔ Give your friends fewer{' '}
            <span className="text-important">email notifications</span>.
          </li>
          <li>
            ✔ Help your family{' '}
            <span className="text-important">ditch the spam</span>.
          </li>
        </ul>
        <p>
          Just a few great reasons to refer a friend to Leave Me Alone today!
        </p>
      </div>
      <div className="modal-actions">
        <div className="modal-actions-info" />
        <div className="modal-buttons">
          {referralBalance > 0 ? (
            <a className="btn muted compact cash-out" onClick={onClickCash}>
              Cash out
            </a>
          ) : null}
          <a className="btn muted compact" onClick={onClickClose}>
            Close
          </a>
        </div>
      </div>
    </>
  );
}
