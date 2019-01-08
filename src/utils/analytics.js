import { PRICES } from '../components/price-modal';

export function trackPurchase({ timeframe }) {
  const price = getPrice(timeframe);
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      event_category: 'scans',
      event_label: timeframe,
      value: price
    });
  }
}

export function trackFreeScan() {
  if (window.gtag) {
    window.gtag('event', 'free_scan', {
      event_category: 'scans'
    });
  }
}

export function trackPriceModalOpen() {
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      event_category: 'scans'
    });
  }
}

// export function trackLogin({ method = 'Google' }) {
//   gtag('event', 'login', {
//     method,
//     event_category: 'users'
//   });
// }

// export function trackSignup({ method = 'Google' }) {
//   gtag('event', 'sign_up', {
//     method,
//     event_category: 'users'
//   });
// }

function getPrice(timeframe) {
  const scan = PRICES.find(p => p.value === timeframe);
  return scan.price / 100;
}
