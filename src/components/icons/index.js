import React from 'react';
import cx from 'classnames';
import styles from './icons.module.scss';

export function Refresh({ width = 32, height = 32, ...visProps }) {
  return (
    <svg
      className={getClasses('refresh', visProps)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={width}
      height={height}
      fill="none"
      stroke="currentcolor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
    >
      <path d="M29 16 C29 22 24 29 16 29 8 29 3 22 3 16 3 10 8 3 16 3 21 3 25 6 27 9 M20 10 L27 9 28 2" />
    </svg>
  );
}
export const HeartIcon = visProps => (
  <svg
    className={getClasses('heart', visProps)}
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

export function Gift({ width = 32, height = 32, amount, ...visProps }) {
  return (
    <span
      className={styles['giftWrapper']}
      style={{ lineHeight: `${height}px` }}
      data-amount={amount}
    >
      <svg
        data-icon="gift"
        className={getClasses('gift', visProps)}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width={width}
        height={height}
        fill="none"
        stroke="currentcolor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="M4 14 L4 30 28 30 28 14 M2 9 L2 14 30 14 30 9 2 9 Z M16 9 C 16 9 14 0 8 3 2 6 16 9 16 9 16 9 18 0 24 3 30 6 16 9 16 9" />
      </svg>
    </span>
  );
}

export const Arrow = ({ direction, ...visProps }) => {
  if (direction === 'right') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={getClasses('arrows', visProps)}
        viewBox="0 0 32 32"
        width="15"
        height="15"
        fill="none"
        stroke="currentcolor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      >
        <path d="M22 6 L30 16 22 26 M30 16 L2 16" />
      </svg>
    );
  }
  throw 'not implemented';
};

export const SettingsIcon = visProps => (
  <svg
    className={getClasses('settings', visProps)}
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
    className={getClasses('mail', visProps)}
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
    className={getClasses('card', visProps)}
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
    className={getClasses('external', visProps)}
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
    className={getClasses('twitter', visProps)}
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
    className={getClasses('clock', visProps)}
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
    className={getClasses('reload', visProps)}
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
    className={getClasses('close', visProps)}
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

export const LockIcon = ({ width = '12', height = '12', ...visProps }) => (
  <svg
    className={getClasses('lock', visProps)}
    viewBox="0 0 32 32"
    width={width}
    height={height}
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

export const UserIcon = ({ width = '15', height = '15', ...visProps }) => (
  <svg
    className={getClasses('user', visProps)}
    viewBox="0 0 32 32"
    width={width}
    height={height}
    fill="none"
    stroke="currentcolor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    <path d="M22 11 C22 16 19 20 16 20 13 20 10 16 10 11 10 6 12 3 16 3 20 3 22 6 22 11 Z M4 30 L28 30 C28 21 22 20 16 20 10 20 4 21 4 30 Z" />
  </svg>
);

export const LinkIcon = ({ width = '15', height = '15', ...visProps }) => (
  <svg
    className={getClasses('link', visProps)}
    viewBox="0 0 32 32"
    width={width}
    height={height}
    fill="none"
    stroke="currentcolor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    <path d="M18 8 C18 8 24 2 27 5 30 8 29 12 24 16 19 20 16 21 14 17 M14 24 C14 24 8 30 5 27 2 24 3 20 8 16 13 12 16 11 18 15" />
  </svg>
);

export const StarIcon = ({ width = '32', height = '32', ...visProps }) => (
  <svg
    styleName={getClasses('star', visProps)}
    viewBox="0 0 32 32"
    width={width}
    height={height}
    fill="none"
    stroke="currentcolor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    <path d="M16 2 L20 12 30 12 22 19 25 30 16 23 7 30 10 19 2 12 12 12 Z" />
  </svg>
);

export function OutlookIcon({ width = '34', height = '34' }) {
  return (
    <svg width={width} height={height} viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

export function GoogleIcon({ width = '34', height = '34' }) {
  return (
    <svg width={width} height={height} viewBox="0 0 48 48">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.991 21.991 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
      <path fill="none" d="M2 2h44v44H2z" />
    </svg>
  );
}

function getClasses(className, visProps = {}) {
  const classes = cx(styles['icon'], {
    [styles[className]]: true,
    ...Object.keys(visProps).reduce((out, p) => {
      const hasStyle = !!styles[p];
      if (hasStyle) {
        return { ...out, [styles[p]]: visProps[p] };
      }
      return out;
    }, {})
  });
  return classes;
}
