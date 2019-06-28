// import './modal.module.scss';

// import CheckoutForm, { getCoupon, sendPayment } from '../checkout-form';
// import React, { useEffect, useState } from 'react';

// import Button from '../btn';
// import { FormInput } from '../form';
// import { LockIcon } from '../icons';
// import ModalClose from './modal-close';
// import { PRICES } from '../../utils/prices';
// import { TextImportant } from '../text';
// import cx from 'classnames';
// import format from 'date-fns/format';
// import request from '../../utils/request';
// import subDays from 'date-fns/sub_days';
// import subMonths from 'date-fns/sub_months';
// import subWeeks from 'date-fns/sub_weeks';
// import { useAsync } from 'react-use';

// export default ({ onClose, onPurchase }) => {
//   const [isShown, setShown] = useState(false);
//   const [screen, setScreen] = useState('pricing');
//   const [isPaymentLoading] = useState(false);

//   const handleKeydown = e => {
//     if (e.keyCode === 27 || e.key === 'Escape') {
//       onClickClose();
//     }
//   };

//   // on mount
//   useEffect(() => {
//     setShown(true);
//     document.addEventListener('keydown', handleKeydown, false);
//     return function cleanup() {
//       document.removeEventListener('keydown', handleKeydown);
//     };
//   }, []);

//   const onClickClose = () => {
//     setShown(false);
//     setTimeout(onClose, 300);
//   };
//   const onClickPurchase = async selected => {
//     setShown(false);
//     setTimeout(() => {
//       if (selected === 'free') {
//         return onPurchase('3d');
//       }
//       return onPurchase(selected);
//     }, 300);
//   };

//   let content;
//   if (screen === 'pricing') {
//     content = (
//       <PricingScreen
//         onClickPurchase={onClickPurchase}
//         onClickClose={onClickClose}
//         setScreen={setScreen}
//         isPaymentLoading={isPaymentLoading}
//       />
//     );
//   } else if (screen === 'estimates') {
//     content = <EstimatesScreen setScreen={setScreen} />;
//   }
//   return (
//     <>
//       <div styleName={`modal ${isShown ? 'shown' : ''}`}>
//         <ModalClose onClose={onClickClose} />
//         {content}
//       </div>
//       <div styleName={`modal-bg ${isShown ? 'shown' : ''}`} />
//     </>
//   );
// };

// const PricingScreen = ({ onClickPurchase, onClickClose, setScreen }) => {
//   const [selected, setSelected] = useState('free');
//   const [coupon, setCoupon] = useState('');
//   const [isCouponShown, showCoupon] = useState(false);
//   const [fetchingCoupon, setFetchingCoupon] = useState(false);
//   const [couponData, setCouponData] = useState({
//     coupon: null,
//     percent_off: 0,
//     amount_off: 0,
//     valid: null
//   });
//   const [prices, setPrices] = useState(PRICES);
//   const [isPaymentError, setPaymentError] = useState(false);
//   // const [isPaymentRequired, setPaymentRequired] = useState(false);

//   useEffect(
//     () => {
//       if (couponData.valid) {
//         setPrices(
//           PRICES.map(p => ({
//             ...p,
//             discountedPrice: getDiscountedPrice(p.price, couponData)
//           }))
//         );
//       } else {
//         setPrices(PRICES);
//       }
//     },
//     [couponData.valid]
//   );

//   const onPurchaseSuccess = selected => {
//     setPaymentError(false);
//     onClickPurchase(selected);
//   };

//   const onPurchaseFailed = err => {
//     console.error('purchase failed', err);
//     setPaymentError(err);
//   };

//   const applyCoupon = async coupon => {
//     try {
//       const { percent_off, amount_off } = await getCoupon(coupon);
//       if (percent_off || amount_off) {
//         setCouponData({ coupon, percent_off, amount_off, valid: true });
//       } else {
//         setCouponData({ ...couponData, valid: false });
//       }
//       setFetchingCoupon(false);
//     } catch (err) {
//       setCouponData({ coupon: null });
//       setFetchingCoupon(false);
//     }
//   };

//   return (
//     <>
//       <h3>Ready for a quieter inbox?</h3>
//       <div styleName="modal-content">
//         <p>
//           We’ll scan your inbox for any subscription emails received in the{' '}
//           <TextImportant>last 3 days for free</TextImportant>.
//         </p>
//         <p>
//           To scan for email subscriptions received in the{' '}
//           <TextImportant>last week, last month, or last 6 months</TextImportant>
//           , you can make a one-time purchase of one of these packages.
//         </p>
//         <div styleName="price-free">
//           <a
//             onClick={() => setSelected('free')}
//             data-selected={selected === 'free'}
//             styleName="modal-btn modal-btn--secondary"
//           >
//             <span>3 days</span>
//             <span styleName="price">(free)</span>
//           </a>
//         </div>
//         <div styleName="price-paid">
//           {prices.map(p => (
//             <a
//               key={p.value}
//               onClick={() => setSelected(p.value)}
//               data-selected={selected === p.value}
//               styleName={cx(`modal-btn modal-btn--secondary`, {
//                 disabled: p.disabled
//               })}
//             >
//               <span>{p.label}</span>
//               {p.discountedPrice !== undefined ? (
//                 <span styleName="price">
//                   (
//                   <span styleName="price-discounted">{`$${p.price /
//                     100}`}</span>{' '}
//                   ${p.discountedPrice / 100})
//                 </span>
//               ) : (
//                 <span styleName="price">{`($${p.price / 100})`}</span>
//               )}
//             </a>
//           ))}
//         </div>
//         <div styleName="price-dates">
//           Search for spam between{' '}
//           <TextImportant>{getScanDate(selected)}</TextImportant> and{' '}
//           <TextImportant>today</TextImportant>
//         </div>
//         {isPaymentError ? (
//           <p styleName="model-error">
//             Something went wrong with your payment. You have not been charged.
//             Please try again or contact support.
//           </p>
//         ) : null}
//         <div styleName="estimates">
//           <p styleName="modal-text--small">
//             Not sure what package is best for you? Let us{' '}
//             <a onClick={() => setScreen('estimates')}>
//               estimate the number of spam messages you might have
//             </a>
//             .
//           </p>
//         </div>
//         <div styleName={cx(`coupon`, { 'coupon-shown': isCouponShown })}>
//           <div
//             styleName={cx('coupon-input', {
//               valid: couponData.valid === true,
//               invalid: couponData.valid === false
//             })}
//           >
//             <FormInput
//               value={coupon}
//               placeholder="Discount coupon"
//               onChange={e => {
//                 setCoupon(e.currentTarget.value);
//                 setCouponData({ valid: null });
//               }}
//             />
//           </div>
//           <span styleName="coupon-btn">
//             <Button
//               compact={true}
//               basic={true}
//               fill={true}
//               disabled={!coupon}
//               loading={fetchingCoupon}
//               onClick={() => {
//                 setFetchingCoupon(true);
//                 applyCoupon(coupon);
//               }}
//             >
//               Apply
//             </Button>
//           </span>
//         </div>
//         <div styleName="add-coupon">
//           <p>
//             <a styleName="modal-text--small" onClick={() => showCoupon(true)}>
//               Have a discount coupon?
//             </a>
//           </p>
//         </div>
//       </div>
//       <div styleName="modal-actions">
//         <div styleName="modal-actions-info">
//           <p styleName="modal-text--small secured-by">
//             <LockIcon />
//             Payments Secured by{' '}
//             <a href="https://stripe.com/docs/security/stripe">Stripe</a>
//           </p>
//         </div>
//         <div styleName="modal-buttons">
//           <a
//             styleName="modal-btn modal-btn--secondary modal-btn--cancel"
//             onClick={onClickClose}
//           >
//             Cancel
//           </a>

//           {getPaymentButton({
//             selected,
//             prices,
//             couponData,
//             onPurchaseSuccess,
//             onPurchaseFailed
//           })}
//         </div>
//       </div>
//     </>
//   );
// };

// function getPaymentButton({
//   selected,
//   prices,
//   couponData,
//   onPurchaseSuccess,
//   onPurchaseFailed
// }) {
//   let isFree = false;

//   if (selected === 'free' || process.env.BETA) {
//     isFree = true;
//   } else if (selected !== 'free') {
//     const { discountedPrice } = prices.find(p => p.value === selected);
//     isFree = discountedPrice === 0;
//   }

//   const [isLoading, setLoading] = useState(false);

//   const sendFreePurchase = async () => {
//     try {
//       setLoading(true);
//       let payment;
//       if (selected !== 'free') {
//         payment = await sendPayment({
//           token: null,
//           productId: selected,
//           coupon: couponData.coupon,
//           address: null,
//           name: null
//         });
//       }
//       console.log(payment);
//       onPurchaseSuccess(selected);
//     } catch (err) {
//       onPurchaseFailed(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (isFree) {
//     return (
//       <Button
//         loading={isLoading}
//         compact={true}
//         basic={true}
//         onClick={() => {
//           sendFreePurchase();
//         }}
//       >
//         Scan now
//       </Button>
//     );
//   }

//   return (
//     <CheckoutForm
//       coupon={couponData.coupon}
//       onCheckoutFailed={err => onPurchaseFailed(err)}
//       onCheckoutComplete={() => onPurchaseSuccess(selected)}
//       selected={prices.find(s => s.value === selected)}
//     />
//   );
// }

// function getDiscountedPrice(amount, { percent_off, amount_off } = {}) {
//   let price = amount;
//   if (percent_off) {
//     price = amount - amount * (percent_off / 100);
//   } else if (amount_off) {
//     price = amount - amount_off;
//   }
//   return price < 50 ? 0 : price;
// }

// async function getEstimates() {
//   try {
//     const estimates = await request('/api/mail/estimates');
//     return estimates;
//   } catch (err) {
//     console.error(err);
//     throw err;
//   }
// }

// const timeframeLabel = {
//   '3d': '3 days',
//   '1w': '1 week',
//   '1m': '1 month',
//   '6m': '6 months'
// };
// const EstimatesScreen = ({ setScreen }) => {
//   const { error, value: estimates, loading } = useAsync(getEstimates);
//   return (
//     <>
//       <h3>Estimating...</h3>
//       <div styleName="modal-content">
//         <div>
//           {loading ? (
//             <p>Requesting an estimate for your emails...please wait...</p>
//           ) : (
//             <p>Here are our estimates:</p>
//           )}
//         </div>
//         {estimates ? (
//           <>
//             <ul styleName="estimates-list">
//               {estimates.map(({ timeframe, totalSpam }) => {
//                 return (
//                   <li key={timeframe}>
//                     In the past{' '}
//                     <span styleName="estimates-timeframe">
//                       {timeframeLabel[timeframe]}
//                     </span>{' '}
//                     you have received{' '}
//                     <span styleName="estimates-value">{totalSpam}</span>{' '}
//                     subscription emails.
//                   </li>
//                 );
//               })}
//             </ul>
//             <div styleName="source">
//               <h5>How do we get this information?</h5>
//               <p>
//                 Your mail provider gives us estimates of the quantity of emails
//                 in your inbox. Using this and{' '}
//                 <a href="https://www.statista.com/statistics/420391/spam-email-traffic-share/">
//                   research into the number of spam emails users receive on
//                   average (48.16%)
//                 </a>
//                 , then we work out the estimated amount of spam!
//               </p>
//             </div>
//           </>
//         ) : null}

//         {error ? (
//           <p styleName="model-error">
//             Something went wrong, please try again or contact support.
//           </p>
//         ) : null}
//       </div>
//       <div styleName="modal-actions">
//         <a
//           styleName="modal-btn modal-btn--secondary"
//           onClick={() => setScreen('pricing')}
//         >
//           Go back
//         </a>
//       </div>
//     </>
//   );
// };

// const dateFormat = 'Do MMM YYYY';
// function getScanDate(selected) {
//   const timeframe = selected === 'free' ? '3d' : selected;
//   const { then } = getTimeRange(timeframe);
//   const thenStr = format(then, dateFormat);
//   return thenStr;
// }

// function getTimeRange(timeframe) {
//   let then;
//   const now = Date.now();
//   const [value, unit] = timeframe;
//   if (unit === 'd') {
//     then = subDays(now, value);
//   } else if (unit === 'w') {
//     then = subWeeks(now, value);
//   } else if (unit === 'm') {
//     then = subMonths(now, value);
//   }
//   return { then, now };
// }
