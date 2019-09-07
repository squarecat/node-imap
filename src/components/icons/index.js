import React from 'react';
import aolIconImg from '../../assets/providers/imap/aol-logo.png';
import cx from 'classnames';
import fastmailIconImg from '../../assets/providers/imap/fastmail-icon.png';
import icloudIconImg from '../../assets/providers/imap/icloud-icon.png';
import styles from './icons.module.scss';
import yahooIconImg from '../../assets/providers/imap/yahoo-icon.png';

export function PointyArrow({ width = 32, height = 32 }) {
  return (
    <svg
      className={styles.pointyArrow}
      width={width}
      height={height}
      fill="currentcolor"
      stroke="currentcolor"
      viewBox="0 0 26 26"
    >
      <path d="M 7.9824219 1 C 7.8184219 1 7.5722344 1.0801562 7.4902344 1.1601562 C 7.3262344 1.2401563 3.467875 4.280625 1.171875 7.640625 C 1.006875 7.960625 0.92584375 8.2795313 1.0898438 8.5195312 C 1.2538437 8.8395313 1.4981719 9 1.8261719 9 L 4.9765625 9 L 6.1074219 9 C 7.1113597 18.534627 15.205593 26 25 26 L 25 22 C 17.37218 22 11.123409 16.353534 10.148438 9 L 10.976562 9 L 14.126953 9 C 14.454953 9 14.699312 8.8395313 14.945312 8.5195312 C 15.027313 8.1995312 15.027281 7.880625 14.863281 7.640625 C 12.567281 4.360625 8.7206406 1.2401562 8.5566406 1.1601562 C 8.3986406 1.0821563 8.164 1.0089062 8 1.0039062 C 7.995 1.0039062 7.9874219 1 7.9824219 1 z" />
    </svg>
  );
}

export function Info({ width = 32, height = 32, ...props }) {
  return (
    <svg
      {...props}
      viewBox="0 0 32 32"
      width={width}
      height={height}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
    >
      <path d="M16 14 L16 23 M16 8 L16 10" />
      <circle cx="16" cy="16" r="14" />
    </svg>
  );
}

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

export const HeartIcon = ({ width = 15, height = 15, ...visProps }) => (
  <svg
    className={getClasses('heart', visProps)}
    viewBox="0 0 32 32"
    width={width}
    height={height}
    stroke="currentcolor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    <path d="M4 16 C1 12 2 6 7 4 12 2 15 6 16 8 17 6 21 2 26 4 31 6 31 12 28 16 25 20 16 28 16 28 16 28 7 20 4 16 Z" />
  </svg>
);

export function SearchIcon({ width = 32, height = 32 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={width}
      height={height}
      fill="none"
      stroke="currentcolor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      data-icon="search"
    >
      <circle cx="14" cy="14" r="12" />
      <path d="M23 23 L30 30" />
    </svg>
  );
}

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

export const Arrow = ({
  width = 15,
  height = 15,
  direction = 'right',
  ...visProps
}) => {
  const arrowClasses = cx('arrows', {
    direction
  });
  if (direction === 'right') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={getClasses(arrowClasses, visProps)}
        viewBox="0 0 32 32"
        width={width}
        height={height}
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
  if (direction === 'left') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width={width}
        height={height}
        fill="none"
        stroke="currentcolor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      >
        <path d="M10 6 L2 16 10 26 M2 16 L30 16" />
      </svg>
    );
  }
  throw 'Icon not implemented';
};

export const SettingsIcon = ({ width = 15, height = 15, ...visProps }) => (
  <svg
    className={getClasses('settings', visProps)}
    viewBox="0 0 32 32"
    width={width}
    height={height}
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

export const GearIcon = ({ width = 15, height = 15 }) => (
  <svg aria-label="gear" viewBox="0 0 24 24" width={width} height={height}>
    <path d="M22.51,14.46l-1.59-1.31A8.77,8.77,0,0,0,21,12h0a8.77,8.77,0,0,0-.08-1.15l1.59-1.31A2,2,0,0,0,23,7L21.82,5a2,2,0,0,0-2.44-.87l-1.93.72a9.17,9.17,0,0,0-2-1.16l-.33-2a2,2,0,0,0-2-1.67h-2.3a2,2,0,0,0-2,1.67l-.33,2a9.17,9.17,0,0,0-2,1.16L4.62,4.13A2,2,0,0,0,2.18,5L1,7a2,2,0,0,0,.46,2.54l1.59,1.31A8.77,8.77,0,0,0,3,12H3a8.77,8.77,0,0,0,.08,1.15L1.49,14.46A2,2,0,0,0,1,17l1.15,2a2,2,0,0,0,2.44.87l1.93-.72a9.17,9.17,0,0,0,2,1.16l.33,2a2,2,0,0,0,2,1.67h2.3a2,2,0,0,0,2-1.67l.33-2a9.17,9.17,0,0,0,2-1.16l1.93.72A2,2,0,0,0,21.82,19L23,17A2,2,0,0,0,22.51,14.46ZM12,16a4,4,0,1,1,4-4A4,4,0,0,1,12,16Z" />
  </svg>
);

export const OptionsIcon = ({ width = 15, height = 15 }) => (
  <svg
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
    <path d="M28 6 L4 6 M28 16 L4 16 M28 26 L4 26 M24 3 L24 9 M8 13 L8 19 M20 23 L20 29" />
  </svg>
);
export const MailIcon = ({ width = 15, height = 15, ...visProps }) => (
  <svg
    className={getClasses('mail', visProps)}
    viewBox="0 0 32 32"
    width={width}
    height={height}
    fill="none"
    stroke="currentcolor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    <path d="M2 26 L30 26 30 6 2 6 Z M2 6 L16 16 30 6" />
  </svg>
);

export const CreditCardIcon = ({ width = 15, height = 15, ...visProps }) => (
  <svg
    className={getClasses('card', visProps)}
    viewBox="0 0 32 32"
    width={width}
    height={height}
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

export const ExternalIcon = ({ width = 14, height = 14, ...visProps }) => (
  <svg
    className={getClasses('external', visProps)}
    viewBox="0 0 32 32"
    width={width}
    height={height}
    fill="none"
    stroke="currentcolor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    <path d="M14 9 L3 9 3 29 23 29 23 18 M18 4 L28 4 28 14 M28 4 L14 18" />
  </svg>
);

export const EditIcon = ({ width = 14, height = 14, ...visProps }) => (
  <svg
    className={getClasses('edit', visProps)}
    viewBox="0 0 32 32"
    width={width}
    height={height}
    fill="none"
    stroke="currentcolor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    <path d="M30 7 L25 2 5 22 3 29 10 27 Z M21 6 L26 11 Z M5 22 L10 27 Z" />
  </svg>
);

export const TwitterIcon = ({ width = 20, height = 20, ...visProps }) => (
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

export const FacebookIcon = ({ width = 20, height = 20, ...visProps }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    width={width}
    height={height}
    className={getClasses('facebook', visProps)}
  >
    <path
      fill="currentColor"
      d="M23.9981 11.9991C23.9981 5.37216 18.626 0 11.9991 0C5.37216 0 0 5.37216 0 11.9991C0 17.9882 4.38789 22.9522 10.1242 23.8524V15.4676H7.07758V11.9991H10.1242V9.35553C10.1242 6.34826 11.9156 4.68714 14.6564 4.68714C15.9692 4.68714 17.3424 4.92149 17.3424 4.92149V7.87439H15.8294C14.3388 7.87439 13.8739 8.79933 13.8739 9.74824V11.9991H17.2018L16.6698 15.4676H13.8739V23.8524C19.6103 22.9522 23.9981 17.9882 23.9981 11.9991Z"
    />
  </svg>
);

export const LinkedInIcon = ({ width = 20, height = 20, ...visProps }) => (
  <svg
    version="1.1"
    viewBox="0 0 172 172"
    width={width}
    height={height}
    className={getClasses('linkedin', visProps)}
  >
    <g
      fill="none"
      fillRule="nonzero"
      stroke="none"
      strokeWidth="1"
      strokeLinecap="butt"
      strokeLinejoin="miter"
      strokeMiterlimit="10"
      strokeDasharray=""
      strokeDashoffset="0"
      fontFamily="none"
      fontWeight="none"
      fontSize="none"
      textAnchor="none"
    >
      <path d="M0,172v-172h172v172z" fill="none" />
      <g fill="currentColor">
        <path d="M136.16667,21.5h-100.33333c-7.91917,0 -14.33333,6.41417 -14.33333,14.33333v100.33333c0,7.91917 6.41417,14.33333 14.33333,14.33333h100.33333c7.91917,0 14.33333,-6.41417 14.33333,-14.33333v-100.33333c0,-7.91917 -6.41417,-14.33333 -14.33333,-14.33333zM64.5,121.83333h-18.0815v-50.16667h18.0815zM55.14033,62.47183c-5.5255,0 -9.21633,-3.68367 -9.21633,-8.6c0,-4.91633 3.68367,-8.6 9.8255,-8.6c5.5255,0 9.21633,3.68367 9.21633,8.6c0,4.91633 -3.68367,8.6 -9.8255,8.6zM129,121.83333h-17.501v-27.41967c0,-7.58233 -4.6655,-9.331 -6.41417,-9.331c-1.74867,0 -7.58233,1.16817 -7.58233,9.331c0,1.16817 0,27.41967 0,27.41967h-18.0815v-50.16667h18.0815v7.00183c2.32917,-4.085 6.99467,-7.00183 15.74517,-7.00183c8.7505,0 15.75233,7.00183 15.75233,22.747z" />
      </g>
    </g>
  </svg>
);

export const ClockIcon = ({ width = 14, height = 14, ...visProps }) => (
  <svg
    className={getClasses('clock', visProps)}
    viewBox="0 0 32 32"
    width={width}
    height={height}
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

export const ReloadIcon = ({ width = 14, height = 14, ...visProps }) => (
  <svg
    className={getClasses('reload', visProps)}
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

export const CloseIcon = ({ width = 16, height = 16, ...visProps }) => (
  <svg
    className={getClasses('close', visProps)}
    viewBox="0 0 32 32"
    width={width}
    height={height}
    fill="none"
    stroke="currentcolor"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 30 L30 2 M30 30 L2 2" />
  </svg>
);

export const LockIcon = ({ width = 12, height = 12, ...visProps }) => (
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

export const UserIcon = ({ width = 15, height = 15, ...visProps }) => (
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

export const LinkIcon = ({ width = 15, height = 15, ...visProps }) => (
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

export const StarIcon = ({ width = 32, height = 32, ...visProps }) => (
  <svg
    className={getClasses('star', visProps)}
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

export const BellIcon = ({ width = 32, height = 32, ...visProps }) => (
  <svg
    className={getClasses('bell', visProps)}
    viewBox="0 0 32 32"
    width={width}
    height={height}
    fill="none"
    stroke="currentcolor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    <path d="M8 17 C8 12 9 6 16 6 23 6 24 12 24 17 24 22 27 25 27 25 L5 25 C5 25 8 22 8 17 Z M20 25 C20 25 20 29 16 29 12 29 12 25 12 25 M16 3 L16 6" />
  </svg>
);

export const WorkIcon = ({ width = 32, height = 32, ...visProps }) => (
  <svg
    className={getClasses('work', visProps)}
    viewBox="0 0 32 32"
    width={width}
    height={height}
    fill="none"
    stroke="currentcolor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    <path d="M30 8 L2 8 2 26 30 26 Z M20 8 C20 8 20 4 16 4 12 4 12 8 12 8 M8 26 L8 8 M24 26 L24 8" />
  </svg>
);

export const ConnectIcon = ({ width = 32, height = 32, ...visProps }) => (
  <svg
    className={getClasses('connect', visProps)}
    width={width}
    height={height}
    viewBox="0 0 24 24"
  >
    <path
      fill="currentcolor"
      d="M 19 3 C 17.346 3 16 4.346 16 6 C 16 6.4617584 16.113553 6.8939944 16.300781 7.2851562 L 12.585938 11 L 7.8164062 11 C 7.4021391 9.8387486 6.3016094 9 5 9 C 3.346 9 2 10.346 2 12 C 2 13.654 3.346 15 5 15 C 6.3016094 15 7.4021391 14.161251 7.8164062 13 L 12.585938 13 L 16.300781 16.714844 C 16.113553 17.106006 16 17.538242 16 18 C 16 19.654 17.346 21 19 21 C 20.654 21 22 19.654 22 18 C 22 16.346 20.654 15 19 15 C 18.538242 15 18.106006 15.113553 17.714844 15.300781 L 14.414062 12 L 17.714844 8.6992188 C 18.106006 8.8864466 18.538242 9 19 9 C 20.654 9 22 7.654 22 6 C 22 4.346 20.654 3 19 3 z"
    />
  </svg>
);

export const ToggleIcon = ({ width = 32, height = 32, ...visProps }) => (
  <svg
    className={getClasses('toggle', visProps)}
    width={width}
    height={height}
    viewBox="0 0 32 32"
    fill="currentcolor"
  >
    <g id="surface1">
      <path d="M 9 7 C 4.039063 7 0 11.035156 0 16 C 0 20.964844 4.039063 25 9 25 L 23 25 C 27.957031 25 32 20.957031 32 16 C 32 11.042969 27.957031 7 23 7 Z M 23 9 C 26.878906 9 30 12.121094 30 16 C 30 19.878906 26.878906 23 23 23 C 19.121094 23 16 19.878906 16 16 C 16 12.121094 19.121094 9 23 9 Z " />
    </g>
  </svg>
);

export const KeyIcon = ({ width = '30', height = '30' }) => (
  <svg
    className={getClasses('key')}
    viewBox="0 0 24 24"
    version="1.1"
    width={width}
    height={height}
    fill="currentcolor"
  >
    <g>
      <path d="M 14.414063 11.144531 C 14.957031 10.09375 15.273438 8.902344 15.273438 7.636719 C 15.273438 3.421875 11.851563 0 7.636719 0 C 3.421875 0 0 3.417969 0 7.636719 C 0 11.851563 3.421875 15.273438 7.636719 15.273438 C 8.902344 15.273438 10.09375 14.960938 11.140625 14.414063 L 15.273438 18.542969 L 17.453125 18.542969 C 17.453125 18.546875 17.453125 20.726563 17.453125 20.726563 L 19.636719 20.726563 L 19.636719 22.910156 L 20.726563 24 L 24 24 L 24 20.726563 Z M 5.5 8 C 4.121094 8 3 6.882813 3 5.5 C 3 4.117188 4.121094 3 5.5 3 C 6.882813 3 8 4.117188 8 5.5 C 8 6.882813 6.882813 8 5.5 8 Z " />
    </g>
  </svg>
);

export const AtSignIcon = ({ width = 30, height = 30, ...visProps }) => (
  <svg
    className={getClasses('atsign', visProps)}
    width={width}
    height={height}
    viewBox="0 0 30 30"
    stroke="none"
    fillRule="nonzero"
    fill="currentcolor"
  >
    <g>
      <path d="M 18.363281 18.890625 L 18.269531 18.890625 C 17.382812 21.792969 15.632812 23.242188 13.027344 23.242188 C 11.355469 23.242188 10.015625 22.625 8.996094 21.394531 C 7.980469 20.164062 7.46875 18.507812 7.46875 16.425781 C 7.46875 13.675781 8.171875 11.386719 9.578125 9.566406 C 10.984375 7.746094 12.835938 6.835938 15.125 6.835938 C 16 6.835938 16.78125 7.058594 17.472656 7.511719 C 18.160156 7.960938 18.601562 8.53125 18.796875 9.210938 L 18.867188 9.210938 C 18.890625 8.867188 18.953125 8.167969 19.050781 7.109375 L 21.332031 7.109375 C 20.761719 13.820312 20.476562 17.238281 20.476562 17.359375 C 20.476562 19.878906 21.199219 21.140625 22.648438 21.140625 C 23.964844 21.140625 25.058594 20.429688 25.929688 19.003906 C 26.800781 17.578125 27.234375 15.734375 27.234375 13.46875 C 27.234375 10.121094 26.175781 7.382812 24.058594 5.265625 C 21.9375 3.144531 19.003906 2.085938 15.25 2.085938 C 11.632812 2.085938 8.644531 3.355469 6.28125 5.886719 C 3.917969 8.421875 2.738281 11.585938 2.738281 15.386719 C 2.738281 19.125 3.859375 22.144531 6.109375 24.441406 C 8.355469 26.734375 11.386719 27.886719 15.199219 27.886719 C 18.207031 27.886719 20.777344 27.382812 22.910156 26.386719 L 22.910156 28.652344 C 20.804688 29.550781 18.171875 30 15.019531 30 C 10.585938 30 7.015625 28.664062 4.304688 25.988281 C 1.59375 23.316406 0.238281 19.816406 0.238281 15.492188 C 0.238281 11.035156 1.660156 7.339844 4.503906 4.402344 C 7.347656 1.46875 10.980469 0 15.402344 0 C 19.542969 0 22.972656 1.230469 25.6875 3.691406 C 28.402344 6.148438 29.761719 9.359375 29.761719 13.316406 C 29.761719 16.21875 29.046875 18.597656 27.613281 20.453125 C 26.183594 22.3125 24.4375 23.238281 22.378906 23.238281 C 19.714844 23.242188 18.375 21.792969 18.363281 18.890625 Z M 15.09375 8.953125 C 13.582031 8.953125 12.359375 9.671875 11.429688 11.109375 C 10.496094 12.546875 10.03125 14.332031 10.03125 16.460938 C 10.03125 17.902344 10.34375 19.03125 10.972656 19.859375 C 11.601562 20.6875 12.4375 21.101562 13.484375 21.101562 C 14.996094 21.101562 16.191406 20.351562 17.074219 18.847656 C 17.957031 17.34375 18.398438 15.347656 18.398438 12.863281 C 18.398438 10.257812 17.296875 8.953125 15.09375 8.953125 Z M 15.09375 8.953125 " />
    </g>
  </svg>
);

export function MicrosoftIcon({ width = '34', height = '34' }) {
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

export function ICloudIcon() {
  return <img src={icloudIconImg} styleName="icon-image" />;
}

export function FastmailIcon() {
  return <img src={fastmailIconImg} styleName="icon-image" />;
}

export function AolIcon() {
  return <img src={aolIconImg} styleName="icon-image" />;
}

export function YahooIcon() {
  return <img src={yahooIconImg} styleName="icon-image" />;
}

export function PoweredByStripe({ width = 119, height = 26 }) {
  return (
    <svg width={width} height={height}>
      <path
        fillRule="evenodd"
        opacity="0.349"
        fill="rgb(66, 71, 112)"
        d="M113.000,26.000 L6.000,26.000 C2.686,26.000 -0.000,23.314 -0.000,20.000 L-0.000,6.000 C-0.000,2.686 2.686,-0.000 6.000,-0.000 L113.000,-0.000 C116.314,-0.000 119.000,2.686 119.000,6.000 L119.000,20.000 C119.000,23.314 116.314,26.000 113.000,26.000 ZM118.000,6.000 C118.000,3.239 115.761,1.000 113.000,1.000 L6.000,1.000 C3.239,1.000 1.000,3.239 1.000,6.000 L1.000,20.000 C1.000,22.761 3.239,25.000 6.000,25.000 L113.000,25.000 C115.761,25.000 118.000,22.761 118.000,20.000 L118.000,6.000 Z"
      />
      <path
        fillRule="evenodd"
        opacity="0.502"
        fill="rgb(66, 71, 112)"
        d="M60.700,18.437 L59.395,18.437 L60.405,15.943 L58.395,10.871 L59.774,10.871 L61.037,14.323 L62.310,10.871 L63.689,10.871 L60.700,18.437 ZM55.690,16.259 C55.238,16.259 54.774,16.091 54.354,15.764 L54.354,16.133 L53.007,16.133 L53.007,8.566 L54.354,8.566 L54.354,11.229 C54.774,10.913 55.238,10.745 55.690,10.745 C57.100,10.745 58.068,11.881 58.068,13.502 C58.068,15.122 57.100,16.259 55.690,16.259 ZM55.406,11.902 C55.038,11.902 54.669,12.060 54.354,12.376 L54.354,14.628 C54.669,14.943 55.038,15.101 55.406,15.101 C56.164,15.101 56.690,14.449 56.690,13.502 C56.690,12.555 56.164,11.902 55.406,11.902 ZM47.554,15.764 C47.144,16.091 46.681,16.259 46.218,16.259 C44.818,16.259 43.840,15.122 43.840,13.502 C43.840,11.881 44.818,10.745 46.218,10.745 C46.681,10.745 47.144,10.913 47.554,11.229 L47.554,8.566 L48.912,8.566 L48.912,16.133 L47.554,16.133 L47.554,15.764 ZM47.554,12.376 C47.249,12.060 46.881,11.902 46.513,11.902 C45.744,11.902 45.218,12.555 45.218,13.502 C45.218,14.449 45.744,15.101 46.513,15.101 C46.881,15.101 47.249,14.943 47.554,14.628 L47.554,12.376 ZM39.535,13.870 C39.619,14.670 40.251,15.217 41.134,15.217 C41.619,15.217 42.155,15.038 42.702,14.722 L42.702,15.849 C42.103,16.122 41.503,16.259 40.913,16.259 C39.324,16.259 38.209,15.101 38.209,13.460 C38.209,11.871 39.303,10.745 40.808,10.745 C42.187,10.745 43.123,11.829 43.123,13.375 C43.123,13.523 43.123,13.691 43.102,13.870 L39.535,13.870 ZM40.756,11.786 C40.103,11.786 39.598,12.271 39.535,12.997 L41.829,12.997 C41.787,12.281 41.356,11.786 40.756,11.786 ZM35.988,12.618 L35.988,16.133 L34.641,16.133 L34.641,10.871 L35.988,10.871 L35.988,11.397 C36.367,10.976 36.830,10.745 37.282,10.745 C37.430,10.745 37.577,10.755 37.724,10.797 L37.724,11.997 C37.577,11.955 37.409,11.934 37.251,11.934 C36.809,11.934 36.335,12.176 35.988,12.618 ZM29.979,13.870 C30.063,14.670 30.694,15.217 31.578,15.217 C32.062,15.217 32.599,15.038 33.146,14.722 L33.146,15.849 C32.546,16.122 31.946,16.259 31.357,16.259 C29.768,16.259 28.653,15.101 28.653,13.460 C28.653,11.871 29.747,10.745 31.252,10.745 C32.630,10.745 33.567,11.829 33.567,13.375 C33.567,13.523 33.567,13.691 33.546,13.870 L29.979,13.870 ZM31.199,11.786 C30.547,11.786 30.042,12.271 29.979,12.997 L32.273,12.997 C32.231,12.281 31.799,11.786 31.199,11.786 ZM25.274,16.133 L24.200,12.555 L23.137,16.133 L21.927,16.133 L20.117,10.871 L21.464,10.871 L22.527,14.449 L23.590,10.871 L24.810,10.871 L25.873,14.449 L26.936,10.871 L28.283,10.871 L26.484,16.133 L25.274,16.133 ZM17.043,16.259 C15.454,16.259 14.328,15.112 14.328,13.502 C14.328,11.881 15.454,10.745 17.043,10.745 C18.632,10.745 19.748,11.881 19.748,13.502 C19.748,15.112 18.632,16.259 17.043,16.259 ZM17.043,11.871 C16.254,11.871 15.707,12.534 15.707,13.502 C15.707,14.470 16.254,15.133 17.043,15.133 C17.822,15.133 18.369,14.470 18.369,13.502 C18.369,12.534 17.822,11.871 17.043,11.871 ZM11.128,13.533 L9.918,13.533 L9.918,16.133 L8.571,16.133 L8.571,8.892 L11.128,8.892 C12.602,8.892 13.654,9.850 13.654,11.218 C13.654,12.586 12.602,13.533 11.128,13.533 ZM10.939,9.987 L9.918,9.987 L9.918,12.439 L10.939,12.439 C11.718,12.439 12.265,11.944 12.265,11.218 C12.265,10.482 11.718,9.987 10.939,9.987 Z"
      />
      <path
        fillRule="evenodd"
        opacity="0.502"
        fill="rgb(66, 71, 112)"
        d="M111.116,14.051 L105.557,14.051 C105.684,15.382 106.659,15.774 107.766,15.774 C108.893,15.774 109.781,15.536 110.555,15.146 L110.555,17.433 C109.784,17.861 108.765,18.169 107.408,18.169 C104.642,18.169 102.704,16.437 102.704,13.013 C102.704,10.121 104.348,7.825 107.049,7.825 C109.746,7.825 111.154,10.120 111.154,13.028 C111.154,13.303 111.129,13.898 111.116,14.051 ZM107.031,10.140 C106.321,10.140 105.532,10.676 105.532,11.955 L108.468,11.955 C108.468,10.677 107.728,10.140 107.031,10.140 ZM98.108,18.169 C97.114,18.169 96.507,17.750 96.099,17.451 L96.093,20.664 L93.254,21.268 L93.253,8.014 L95.753,8.014 L95.901,8.715 C96.293,8.349 97.012,7.825 98.125,7.825 C100.119,7.825 101.997,9.621 101.997,12.927 C101.997,16.535 100.139,18.169 98.108,18.169 ZM97.446,10.340 C96.795,10.340 96.386,10.578 96.090,10.903 L96.107,15.122 C96.383,15.421 96.780,15.661 97.446,15.661 C98.496,15.661 99.200,14.518 99.200,12.989 C99.200,11.504 98.485,10.340 97.446,10.340 ZM89.149,8.014 L91.999,8.014 L91.999,17.966 L89.149,17.966 L89.149,8.014 ZM89.149,4.836 L91.999,4.230 L91.999,6.543 L89.149,7.149 L89.149,4.836 ZM86.110,11.219 L86.110,17.966 L83.272,17.966 L83.272,8.014 L85.727,8.014 L85.905,8.853 C86.570,7.631 87.897,7.879 88.275,8.015 L88.275,10.625 C87.914,10.508 86.781,10.338 86.110,11.219 ZM80.024,14.475 C80.024,16.148 81.816,15.627 82.179,15.482 L82.179,17.793 C81.801,18.001 81.115,18.169 80.187,18.169 C78.502,18.169 77.237,16.928 77.237,15.247 L77.250,6.138 L80.022,5.548 L80.024,8.014 L82.180,8.014 L82.180,10.435 L80.024,10.435 L80.024,14.475 ZM76.485,14.959 C76.485,17.003 74.858,18.169 72.497,18.169 C71.518,18.169 70.448,17.979 69.392,17.525 L69.392,14.814 C70.345,15.332 71.559,15.721 72.500,15.721 C73.133,15.721 73.589,15.551 73.589,15.026 C73.589,13.671 69.273,14.181 69.273,11.038 C69.273,9.028 70.808,7.825 73.111,7.825 C74.052,7.825 74.992,7.969 75.933,8.344 L75.933,11.019 C75.069,10.552 73.972,10.288 73.109,10.288 C72.514,10.288 72.144,10.460 72.144,10.903 C72.144,12.181 76.485,11.573 76.485,14.959 Z"
      />
    </svg>
  );
}

function getClasses(className, visProps = {}) {
  const additional = Object.keys(visProps).reduce((out, p) => {
    const hasStyle = !!styles[p];
    if (hasStyle) {
      return { ...out, [styles[p]]: visProps[p] };
    }
    return out;
  }, {});
  const classes = cx(styles['icon'], styles[className], additional);
  return classes;
}
