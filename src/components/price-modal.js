import React, { useState, useEffect } from 'react';

import useUser from '../utils/hooks/use-user';
import useAsync from '../utils/hooks/use-async';
import Button from '../components/btn';
import ModalClose from './modal/modal-close';
import CheckoutForm, { getCoupon } from './checkout-form';

import * as track from '../utils/analytics';

import './modal.css';

export const PRICES = [
  {
    price: 300,
    label: '1 week',
    value: '1w'
  },
  {
    price: 500,
    label: '1 month',
    value: '1m'
  },
  {
    price: 800,
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
    track.trackPriceModalOpen();
    document.addEventListener('keydown', handleKeydown, false);
    return function cleanup() {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const onClickClose = () => {
    setShown(false);
    setTimeout(onClose, 300);
  };
  const onClickPurchase = async selected => {
    setShown(false);
    setTimeout(() => {
      if (selected === 'free') {
        track.trackFreeScan();
        return onPurchase('3d');
      }
      track.trackPurchase({ timeframe: selected });
      return onPurchase(selected);
    }, 300);
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
  const [fetchingCoupon, setFetchingCoupon] = useState(false);
  const [couponData, setCouponData] = useState({
    coupon: null,
    percent_off: 0,
    amount_off: 0,
    valid: null
  });
  const [prices, setPrices] = useState(PRICES);
  const [isPaymentError, setPaymentError] = useState(false);
  // const [isPaymentRequired, setPaymentRequired] = useState(false);

  useEffect(
    () => {
      if (couponData.valid) {
        setPrices(
          PRICES.map(p => ({
            ...p,
            discountedPrice: getDiscountedPrice(p.price, couponData)
          }))
        );
      } else {
        setPrices(PRICES);
      }
    },
    [couponData.valid]
  );

  const onPurchaseSuccess = selected => {
    setPaymentError(false);
    onClickPurchase(selected);
  };

  const onPurchaseFailed = err => {
    console.error('purchase failed', err);
    setPaymentError(err);
  };

  const applyCoupon = async coupon => {
    try {
      const { percent_off, amount_off } = await getCoupon(coupon);
      if (percent_off || amount_off) {
        setCouponData({ coupon, percent_off, amount_off, valid: true });
      } else {
        setCouponData({ ...couponData, valid: false });
      }
      setFetchingCoupon(false);
    } catch (err) {
      setCouponData({ coupon: null });
      setFetchingCoupon(false);
    }
  };

  return (
    <>
      <h3>Ready for a quieter inbox?</h3>
      <div className="modal-content">
        <p>
          We’ll scan your inbox for any subscription emails received in the{' '}
          <span className="modal-text-important">last 3 days for free</span>.
        </p>
        <p>
          To scan for email subscriptions received in the{' '}
          <span className="modal-text-important">
            last week, last month, or last 6 months
          </span>
          , you can make a one-time purchase of one of these packages.
        </p>
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
              {p.discountedPrice !== undefined ? (
                <span className="price">
                  (
                  <span className="price-discounted">{`$${p.price /
                    100}`}</span>{' '}
                  ${p.discountedPrice / 100})
                </span>
              ) : (
                <span className="price">{`($${p.price / 100})`}</span>
              )}
            </a>
          ))}
        </div>
        {isPaymentError ? (
          <p className="model-error">
            Something went wrong with your payment. You have not been charged.
            Please try again or contact support.
          </p>
        ) : null}
        <div className="estimates">
          <p className="modal-text--small">
            Not sure what package is best for you? Let us{' '}
            <a onClick={() => setScreen('estimates')}>
              estimate the number of spam messages you might have
            </a>
            .
          </p>
        </div>
        <div className={`coupon ${isCouponShown ? 'shown' : ''}`}>
          <div
            className={`coupon-input
            ${couponData.valid === true ? 'valid' : ''} ${
              couponData.valid === false ? 'invalid' : ''
            }`}
          >
            <input
              value={coupon}
              placeholder="Discount coupon"
              onChange={e => {
                setCoupon(e.currentTarget.value);
                setCouponData({ valid: null });
              }}
            />
          </div>
          <Button
            compact={true}
            disabled={!coupon}
            loading={fetchingCoupon}
            onClick={() => {
              setFetchingCoupon(true);
              applyCoupon(coupon);
            }}
          >
            Apply
          </Button>
        </div>
        <div className="add-coupon">
          <p>
            <a
              className="add-coupon-link modal-text--small"
              onClick={() => showCoupon(true)}
            >
              Have a discount coupon?
            </a>
          </p>
        </div>
      </div>
      <div className="modal-actions">
        <div className="modal-actions-info">
          <p className="modal-text--small monthly-price">
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
          <p className="modal-text--small secured-by">
            <svg
              className="lock-icon"
              id="i-lock"
              viewBox="0 0 32 32"
              width="12"
              height="12"
              fill="none"
              stroke="currentcolor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path d="M5 15 L5 30 27 30 27 15 Z M9 15 C9 9 9 5 16 5 23 5 23 9 23 15 M16 20 L16 23" />
              <circle cx="16" cy="24" r="1" />
            </svg>
            Payments Secured by{' '}
            <a href="https://stripe.com/docs/security/stripe">Stripe</a>
          </p>
        </div>
        <div className="modal-buttons">
          <a className="btn muted compact" onClick={onClickClose}>
            Cancel
          </a>

          {getPaymentButton({
            selected,
            isBeta,
            prices,
            couponData,
            onPurchaseSuccess,
            onPurchaseFailed
          })}
        </div>
      </div>
    </>
  );
};

function getPaymentButton({
  selected,
  isBeta,
  prices,
  couponData,
  onPurchaseSuccess,
  onPurchaseFailed
}) {
  let isFree = false;
  if (selected === 'free' || isBeta) {
    isFree = true;
  } else if (selected !== 'free') {
    const { discountedPrice } = prices.find(p => p.value === selected);
    isFree = discountedPrice === 0;
  }

  const [isLoading, setLoading] = useState(false);

  const freePurchase = async () => {
    try {
      setLoading(true);
      await addPaidScan(selected, couponData.coupon);
    } catch (_) {
    } finally {
      onPurchaseSuccess(selected);
      setLoading(false);
    }
  };

  if (isFree) {
    return (
      <Button
        loading={isLoading}
        compact={true}
        onClick={() => {
          if (selected === 'free' || isBeta) {
            onPurchaseSuccess(selected, isBeta);
          } else {
            freePurchase();
          }
        }}
      >
        Scan now
      </Button>
    );
  }

  return (
    <CheckoutForm
      coupon={couponData.coupon}
      onCheckoutFailed={err => onPurchaseFailed(err)}
      onCheckoutComplete={() => onPurchaseSuccess(selected)}
      selected={prices.find(s => s.value === selected)}
    />
  );
}

function getDiscountedPrice(amount, { percent_off, amount_off } = {}) {
  let price = amount;
  if (percent_off) {
    price = amount - amount * (percent_off / 100);
  } else if (amount_off) {
    price = amount - amount_off;
  }
  return price < 50 ? 0 : price;
}

async function addPaidScan(productId, coupon) {
  try {
    let url;
    if (coupon) {
      url = `/api/me/paidscans/${productId}/${coupon}`;
    } else {
      url = `/api/me/paidscans/${productId}`;
    }
    await fetch(url, {
      method: 'PUT'
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

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
      <h3>Estimating...</h3>
      <div className="modal-content">
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
                Google provides estimates of the quantity of emails in your
                inbox. Using this and{' '}
                <a href="https://www.statista.com/statistics/420391/spam-email-traffic-share/">
                  research into the number of spam emails users receive on
                  average (48.16%)
                </a>
                , then we work out the estimated amount of spam!
              </p>
            </div>
          </>
        ) : null}

        {error ? (
          <div className="estimates-error">{error.toString()}</div>
        ) : null}
      </div>
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
