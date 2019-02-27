import './icons.module.scss';

import React from 'react';

export const HeartIcon = () => (
  <span styleName="icon heart">
    <svg
      viewBox="0 0 32 32"
      width="15"
      height="15"
      stroke="currentcolor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M4 16 C1 12 2 6 7 4 12 2 15 6 16 8 17 6 21 2 26 4 31 6 31 12 28 16 25 20 16 28 16 28 16 28 7 20 4 16 Z" />
    </svg>
  </span>
);

export const SettingsIcon = () => (
  <span styleName="icon settings">
    <svg
      id="i-settings"
      viewBox="0 0 32 32"
      width="15"
      height="15"
      fill="none"
      stroke="currentcolor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M13 2 L13 6 11 7 8 4 4 8 7 11 6 13 2 13 2 19 6 19 7 21 4 24 8 28 11 25 13 26 13 30 19 30 19 26 21 25 24 28 28 24 25 21 26 19 30 19 30 13 26 13 25 11 28 8 24 4 21 7 19 6 19 2 Z" />
      <circle cx="16" cy="16" r="4" />
    </svg>
  </span>
);

export const MailIcon = () => (
  <span styleName="icon mail">
    <svg
      id="i-mail"
      viewBox="0 0 32 32"
      width="15"
      height="15"
      fill="none"
      stroke="currentcolor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M2 26 L30 26 30 6 2 6 Z M2 6 L16 16 30 6" />
    </svg>
  </span>
);

export const CreditCardIcon = () => (
  <span styleName="icon card">
    <svg
      id="i-creditcard"
      viewBox="0 0 32 32"
      width="15"
      height="15"
      fill="none"
      stroke="currentcolor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M2 7 L2 25 30 25 30 7 Z M5 18 L9 18 M5 21 L11 21" />
      <path d="M2 11 L2 13 30 13 30 11 Z" fill="currentColor" />
    </svg>
  </span>
);
