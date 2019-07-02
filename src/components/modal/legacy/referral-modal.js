import './modal.module.scss';

import React, { useEffect, useState } from 'react';

import AnimatedNumber from 'react-animated-number';
import ModalClose from './modal-close';
import { TextImportant } from '../text';
import request from '../../utils/request';
import useAsync from 'react-use/lib/useAsync';

async function fetchReferralStats() {
  return request('/api/me/referrals', {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
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
      <div styleName={`modal ${isShown ? 'shown' : ''}`}>
        <ModalClose onClose={onClickClose} />
        <h3>Refer a friend and earn $</h3>
        {content({ ...stats, onClickCash, onClickClose })}
      </div>
      <div styleName={`modal-bg ${isShown ? 'shown' : ''}`} />
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
      <div styleName="modal-content">
        <p>
          For every 3 people that sign-up using your referral link and make a
          purchase, we will pay you 5 bucks!
        </p>
        <p>Your referral URL is...</p>
        <pre styleName="referral-code">{`https://leavemealone.xyz/r/${referralCode}`}</pre>
        <div styleName="referral-balances">
          <div styleName="referral-box">
            <div styleName="referral-box-title">Balance</div>
            <div styleName="referral-box-value">
              <AnimatedNumber
                stepPrecision={0}
                value={referralBalance ? referralBalance / 100 : 0}
                formatValue={n => `$${n}`}
                duration={250}
              />
            </div>
          </div>
          <div styleName="referral-box">
            <div styleName="referral-box-title">Sign ups</div>
            <div styleName="referral-box-value">
              <AnimatedNumber
                stepPrecision={0}
                value={signedup}
                duration={250}
              />
            </div>
          </div>
          <div styleName="referral-box">
            <div styleName="referral-box-title">Purchases</div>
            <div styleName="referral-box-value">
              <AnimatedNumber
                stepPrecision={0}
                value={purchased}
                duration={250}
              />
            </div>
          </div>
        </div>
        <ul styleName="referral-reasons">
          <li>
            ✔ Increase your <TextImportant>team's productivity</TextImportant>.
          </li>
          <li>
            ✔ Give your friends fewer{' '}
            <TextImportant>email notifications</TextImportant>.
          </li>
          <li>
            ✔ Help your family <TextImportant>ditch the spam</TextImportant>.
          </li>
        </ul>
        <p>
          Just a few great reasons to refer a friend to Leave Me Alone today!
        </p>
      </div>
      <div styleName="modal-actions">
        <div styleName="modal-actions-info" />
        <div styleName="modal-buttons">
          <a styleName="modal-btn modal-btn--secondary" onClick={onClickClose}>
            Close
          </a>
          {referralBalance > 0 ? (
            <a styleName="modal-btn modal-btn--cta" onClick={onClickCash}>
              Cash out
            </a>
          ) : null}
        </div>
      </div>
    </>
  );
}
