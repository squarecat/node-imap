import './icons.module.scss';

import React from 'react';
import cx from 'classnames';

export const HeartIcon = visProps => (
  <svg
    styleName={getClasses('icon heart', visProps)}
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
);

export const SettingsIcon = visProps => (
  <svg
    styleName={getClasses('icon settings', visProps)}
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
);

export const MailIcon = visProps => (
  <svg
    styleName={getClasses('icon mail', visProps)}
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
);

export const CreditCardIcon = visProps => (
  <svg
    styleName={getClasses('icon card', visProps)}
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
);

export const ExternalIcon = visProps => (
  <svg
    styleName={getClasses('icon external', visProps)}
    viewBox="0 0 32 32"
    width="14"
    height="14"
    fill="none"
    stroke="currentcolor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    <path d="M14 9 L3 9 3 29 23 29 23 18 M18 4 L28 4 28 14 M28 4 L14 18" />
  </svg>
);

export const TwitterIcon = ({ width = '20', height = '20', ...visProps }) => (
  <svg
    styleName={getClasses('icon twitter', visProps)}
    viewBox="0 0 64 64"
    width={width}
    height={height}
  >
    <path
      strokeWidth="0"
      fill="currentColor"
      d="M60 16 L54 17 L58 12 L51 14 C42 4 28 15 32 24 C16 24 8 12 8 12 C8 12 2 21 12 28 L6 26 C6 32 10 36 17 38 L10 38 C14 46 21 46 21 46 C21 46 15 51 4 51 C37 67 57 37 54 21 Z"
    />
  </svg>
);

export const ClockIcon = visProps => (
  <svg
    styleName={getClasses('icon clock', visProps)}
    viewBox="0 0 32 32"
    width="14"
    height="14"
    fill="none"
    stroke="currentcolor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    <circle cx="16" cy="16" r="14" />
    <path d="M16 8 L16 16 20 20" />
  </svg>
);

export const ReloadIcon = visProps => (
  <svg
    styleName={getClasses('icon reload', visProps)}
    viewBox="0 0 32 32"
    width="14"
    height="14"
    fill="none"
    stroke="currentcolor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="3"
  >
    <path d="M29 16 C29 22 24 29 16 29 8 29 3 22 3 16 3 10 8 3 16 3 21 3 25 6 27 9 M20 10 L27 9 28 2" />
  </svg>
);

export const CloseIcon = visProps => (
  <svg
    styleName={getClasses('icon close', visProps)}
    viewBox="0 0 32 32"
    width="16"
    height="16"
    fill="none"
    stroke="currentcolor"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 30 L30 2 M30 30 L2 2" />
  </svg>
);

export const LockIcon = visProps => (
  <svg
    styleName={getClasses('icon lock', visProps)}
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
);

function getClasses(classes, visProps = {}) {
  return cx(classes, {
    'pad-left': visProps.padleft
  });
}
