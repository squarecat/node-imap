import React, { useState, useEffect } from 'react';

import useUser from '../utils/hooks/use-user';
import useAsync from '../utils/hooks/use-async';
import Button from '../components/btn';
import ModalClose from './modal/modal-close';
import CheckoutForm from './checkout-form';

import './modal.css';

const prices = [
  {
    price: 3,
    label: '1 week',
    value: '1w'
  },
  {
    price: 5,
    label: '1 month',
    value: '1m'
  },
  {
    price: 8,
    label: '6 months',
    value: '6m'
  }
];
export default ({ onClose, onPurchase }) => {
  const [isShown, setShown] = useState(false);
  const [screen, setScreen] = useState('pricing');
  const [isPaymentLoading, setPaymentLoading] = useState(false);

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
  const onClickPurchase = async (selected, isBeta, coupon) => {
    if (selected === 'free') {
      return onPurchase('3d');
    }
    if (isBeta) {
      return onPurchase(selected);
    }
    setPaymentLoading(true);
    // let resp;
    // if (coupon) {
    // resp = await fetch(`/api/checkout/${selected}/${coupon}`);
    // } else {
    const resp = await fetch(`/api/checkout/${selected}`);
    // }
    const { status, err } = await resp.json();
    setPaymentLoading(false);
  };

  let content;
  if (screen === 'pricing') {
    content = (
      <PricingScreen
        onClickPurchase={onClickPurchase}
        onClickClose={onClickClose}
        setScreen={setScreen}
        isPaymentLoading={isPaymentLoading}
      />
    );
  } else if (screen === 'estimates') {
    content = <EstimatesScreen setScreen={setScreen} />;
  }
  return (
    <>
      <div className={`modal price-modal ${isShown ? 'shown' : ''}`}>
        <ModalClose onClose={onClickClose} />
        {content}
      </div>
      <div className={`modal-bg ${isShown ? 'shown' : ''}`} />
    </>
  );
};

const PricingScreen = ({
  onClickPurchase,
  onClickClose,
  setScreen,
  isPaymentLoading
}) => {
  const [isBeta] = useUser(s => s.beta);
  const [selected, setSelected] = useState('free');
  const [coupon, setCoupon] = useState('');
  const [isCouponShown, showCoupon] = useState(false);

  return (
    <>
      <h3>Ready for a quieter inbox?</h3>
      <p>
        We'll scan your inbox for any subscription emails that you've had in the
        last 3 days for free!
      </p>

      {isBeta ? (
        <p className="beta-text">
          Thanks for Beta Testing <strong>Leave Me Alone</strong>! You don't
          have to pay, so scan as much as you like!
        </p>
      ) : (
        <p>
          To scan before this, you can make a one-off purchase of one of our
          packages.
        </p>
      )}
      <div className="price-free">
        <a
          onClick={() => setSelected('free')}
          data-selected={selected === 'free'}
          className="btn compact muted"
        >
          <span>3 days</span>
          <span className="price">(free)</span>
        </a>
      </div>
      <div className="price-paid">
        {prices.map(p => (
          <a
            key={p.value}
            onClick={() => setSelected(p.value)}
            data-selected={selected === p.value}
            className={`btn compact muted ${p.disabled ? 'disabled' : ''}`}
          >
            <span>{p.label}</span>
            <span className="price">{`($${p.price})`}</span>
          </a>
        ))}
      </div>
      <div className="estimates">
        <p>
          Not sure what package is best for you? Let us{' '}
          <a onClick={() => setScreen('estimates')}>
            estimate the number of spam messages you might have
          </a>
          .
        </p>
      </div>
      {/* <div className={`coupon ${isCouponShown ? 'shown' : ''}`}>
        <input
          className="coupon-input"
          value={coupon}
          placeholder="Discount coupon"
          onChange={e => setCoupon(e.currentTarget.value)}
        />
      </div>
      <div className="add-coupon">
        <p>
          <a className="add-coupon-link" onClick={() => showCoupon(true)}>
            Have a discount coupon?
          </a>
        </p>
      </div> */}
      <div className="modal-actions">
        <p className="monthly-price">
          Looking for a monthly subscription?{' '}
          <a
            onClick={() =>
              openChat(
                "Hi! I'm looking for a monthly subscription to Leave Me Alone."
              )
            }
          >
            Contact us!
          </a>
        </p>
        <a className="btn muted compact" onClick={onClickClose}>
          Cancel
        </a>
        {selected === 'free' || isBeta ? (
          <a
            className="btn compact"
            onClick={() => onClickPurchase(selected, isBeta)}
          >
            OK
          </a>
        ) : (
          <CheckoutForm
            // onClick={() => setPaymentLoading(true)}
            // onSuccess={() => setPaymentLoading(false)}
            selected={prices.find(s => s.value === selected)}
          />
        )}
      </div>
    </>
  );
};

async function getEstimates() {
  try {
    const resp = await fetch('/api/mail/estimates');
    const estimates = resp.json();
    return estimates;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

const timeframeLabel = {
  '3d': '3 days',
  '1w': '1 week',
  '1m': '1 month',
  '6m': '6 months'
};
const EstimatesScreen = ({ setScreen }) => {
  const { error, value: estimates, loading } = useAsync(getEstimates);
  return (
    <>
      <div className="estimates-modal">
        {loading ? (
          <p>Asking Google to estimating your emails...please wait...</p>
        ) : (
          <p>Here are our estimates.</p>
        )}
      </div>
      {estimates ? (
        <>
          <ul className="estimates-list">
            {estimates.map(({ timeframe, totalSpam }) => {
              return (
                <li key={timeframe}>
                  In the past{' '}
                  <span className="estimates-timeframe">
                    {timeframeLabel[timeframe]}
                  </span>{' '}
                  you have received{' '}
                  <span className="estimates-value">{totalSpam}</span>{' '}
                  subscription emails.
                </li>
              );
            })}
          </ul>
          <div className="source">
            <h5>How do we get this information?</h5>
            <p>
              Google provides estimates of the quantity of emails in your inbox.
              Using this and{' '}
              <a href="https://www.statista.com/statistics/420391/spam-email-traffic-share/">
                reseach into the number of spam emails users recieve on average
                (48.16%)
              </a>
              , then we work out the estimated amount of spam!
            </p>
          </div>
        </>
      ) : null}

      {error ? <div className="estimates-error">{error.toString()}</div> : null}
      <div className="modal-actions">
        <a className="btn muted compact" onClick={() => setScreen('pricing')}>
          Go back
        </a>
      </div>
    </>
  );
};

function openChat(message = '') {
  if (window.$crisp) {
    window.$crisp.push(['do', 'chat:open']);
    window.$crisp.push(['set', 'message:text', [message]]);
  }
}
