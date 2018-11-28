import React, { useState, useEffect } from 'react';
import { useGlobal } from '../utils/hooks';
import BuyButton from '../../plugins/gatsby-plugin-paddle/src';
import './modal.css';
import useAsync from '../utils/hooks/use-async';

const prices = [
  {
    price: 3,
    label: '1 week',
    value: '1w',
    productId: '546139'
  },
  {
    price: 5,
    label: '1 month',
    value: '1m',
    productId: 546140
  },
  {
    price: 8,
    label: '6 months',
    value: '6m',
    productId: 546141
  }
];
export default ({ onClose, onPurchase }) => {
  const [isShown, setShown] = useState(false);
  const [screen, setScreen] = useState('pricing');

  // on mount
  useEffect(() => {
    setShown(true);
  }, []);

  const onClickClose = () => {
    setShown(false);
    setTimeout(onClose, 300);
  };
  const onClickPurchase = selected => {
    setShown(false);
    setTimeout(() => onPurchase(selected === 'free' ? '3d' : selected), 300);
  };

  let content;
  if (screen === 'pricing') {
    content = (
      <PricingScreen
        onClickPurchase={onClickPurchase}
        onClickClose={onClickClose}
        setScreen={setScreen}
      />
    );
  } else if (screen === 'estimates') {
    content = <EstimatesScreen setScreen={setScreen} />;
  }
  return (
    <>
      <div className={`modal price-modal ${isShown ? 'shown' : ''}`}>
        {content}
      </div>
      <div className={`modal-bg ${isShown ? 'shown' : ''}`} />
    </>
  );
};

const PricingScreen = ({ onClickPurchase, onClickClose, setScreen }) => {
  const [user] = useGlobal('user');
  const [selected, setSelected] = useState('free');
  const isBeta = !!user.beta;

  return (
    <>
      <h3>Ready for a quieter inbox?</h3>
      <p>
        We'll scan your inbox for any subscription emails that you've had in the
        last 3 days for free!
      </p>
      <p className={`${isBeta ? 'strike' : ''}`}>
        To scan before this, you can make a one-off purchase of one of our
        packages.
      </p>
      {isBeta ? (
        <p>
          Thanks for Beta Testing <strong>Leave Me Alone</strong>! You don't
          have to pay, so scan as much as you like!
        </p>
      ) : null}
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
            className="btn compact muted"
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
        {/* <a
          className="btn centered compact muted"

        >
          Estimate spam
        </a> */}
      </div>
      <div className="modal-actions">
        <span className="monthly-price">
          Looking for a monthly subscription? Contact us!
        </span>
        <a className="btn muted compact" onClick={onClickClose}>
          Cancel
        </a>
        {selected === 'free' || user.beta ? (
          <a className="btn compact" onClick={() => onClickPurchase(selected)}>
            OK
          </a>
        ) : (
          <BuyButton
            className="btn compact"
            productId={prices.find(p => selected === p.value).productId}
            onSuccess={data => onClickPurchase(data)}
            onClose={() => {}}
            message="Thanks for supporting Leave Me Alone!"
          >
            Purchase
          </BuyButton>
        )}
      </div>
    </>
  );
};

async function getEstimates() {
  try {
    const resp = await fetch('/api/mail/estimates');
    const estimates = resp.json();
    console.log(estimates);
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
                  we estimate you will have received{' '}
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
