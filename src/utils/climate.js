import React from 'react';
import numeral from 'numeral';

export const TONNE_CONVERSION = 1e6;

export const EMAILS_SENT_PER_DAY = 246500000000; // 247; // (B) 246500000000
export const CARBON_OFFSET_PER_TREE_PER_YEAR = 15694; // (34.6 pounds)
export const NEWSLETTERS_NEVER_OPENED = 0.75;

export const TONNES_CARBON_PER_YEAR = numeral(
  (EMAILS_SENT_PER_DAY * CARBON_PER_EMAIL) / TONNE_CONVERSION
).format('0,0');

export const CARBON_PER_EMAIL = 4;
export const PECENTAGE_EMAILS_SPAM = 0.08;
export const PERCENTAGE_UNSUBS = 0.36;

// 30000: "London to Paris",
// 480000: "London to New York",
// 1460000: "London to Sydney"
export const CARBON_LONDON_PARIS = 30000;
export const CARBON_PLASTIC_BAG = 10;
export const CARBON_DRIVING_1KM = 260;
export const CARBON_BLACK_COFFEE = 21;

export function formatWeight(weight) {
  if (weight / TONNE_CONVERSION < 1000) {
    const kg = formatNumber(weight / 1000);
    return <span>{kg}kg</span>;
  }

  const tonnes = formatNumber(weight / TONNE_CONVERSION);
  const text = tonnes > 1 ? 'tonnes' : 'tonne';
  return (
    <span>
      {tonnes} {text}
    </span>
  );
}

function formatNumber(num) {
  return numeral(num).format('0,0');
}
