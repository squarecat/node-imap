import React, { useState, useEffect } from 'react';
import { useGlobal } from '../utils/hooks';
import BuyButton from '../../plugins/gatsby-plugin-paddle/src';
import './modal.css';

const prices = [
  {
    price: 3,
    label: '1 week',
    value: '1w',
    productId: 545883
  },
  {
    price: 5,
    label: '1 month',
    value: '1m',
    productId: 2
  },
  {
    price: 8,
    label: '6 months',
    value: '6m',
    productId: 3
  }
];
export default ({ onClose, onPurchase }) => {
  const [user] = useGlobal('user');
  const [selected, setSelected] = useState('free');
  const [isShown, setShown] = useState(false);

  // on mount
  useEffect(() => {
    setShown(true);
  }, []);
  const onClickClose = () => {
    setShown(false);
    setTimeout(onClose, 300);
  };
  const onClickPurchase = data => {
    console.log(data);
    setShown(false);
    setTimeout(() => onPurchase(selected === 'free' ? '3d' : selected), 300);
  };
  const isBeta = !!user.beta;
  return (
    <>
      <div className={`modal price-modal ${isShown ? 'shown' : ''}`}>
        <h3>Ready for a quieter inbox?</h3>
        <p>
          We'll scan your inbox for any subscription emails that you've had in
          the last 3 days for free!
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
        <div className="modal-actions">
          <span className="monthly-price">
            Looking for a monthly subscription? Contact us!
          </span>
          <a className="btn muted compact" onClick={onClickClose}>
            Cancel
          </a>
          {selected === 'free' || user.beta ? (
            <a className="btn compact" onClick={onClickPurchase}>
              OK
            </a>
          ) : (
            <BuyButton
              productId={prices.find(p => selected === p.value).productId}
              onSuccess={data => onClickPurchase(data)}
              onClose={() => {}}
            >
              Purchase
            </BuyButton>
          )}
        </div>
      </div>
      <div className={`modal-bg ${isShown ? 'shown' : ''}`} />
    </>
  );
};
