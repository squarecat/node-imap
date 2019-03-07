import { PRICES } from '../utils/prices';

let gtag;
if (typeof window !== 'undefined') {
  gtag = window.gtag;
}
export function trackPurchase({ timeframe }) {
  const price = getPrice(timeframe);
  if (gtag) {
    gtag('event', 'purchase', {
      event_category: 'scans',
      event_label: timeframe,
      value: price
    });
  }
}

export function trackFreeScan() {
  if (gtag) {
    gtag('event', 'free_scan', {
      event_category: 'scans'
    });
  }
}

export function trackPriceModalOpen() {
  if (gtag) {
    gtag('event', 'begin_checkout', {
      event_category: 'scans'
    });
  }
}

export function trackReferralModalOpen() {
  if (gtag) {
    gtag('event', 'open_referral', {
      event_category: 'referral'
    });
  }
}

export function trackReminderModalOpen() {
  if (gtag) {
    gtag('event', 'open_reminder', {
      event_category: 'reminder'
    });
  }
}

function getPrice(timeframe) {
  const scan = PRICES.find(p => p.value === timeframe);
  return scan.price / 100;
}
