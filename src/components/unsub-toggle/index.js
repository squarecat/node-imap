import React from 'react';
import Toggle from '../toggle';
import { Info as InfoIcon } from '../icons';
import styles from './unsub-toggle.module.scss';

export default function UnsubToggle({
  mail,
  isIgnored,
  onUnsubscribe,
  openUnsubModal
}) {
  const isSubscribed = !!mail.subscribed;
  let content;
  const everythingOk = mail.estimatedSuccess !== false || mail.resolved;
  const status = isSubscribed ? 'subscribed' : 'unsubscribed';
  if (everythingOk) {
    content = (
      <Toggle
        status={isSubscribed}
        loading={mail.isLoading}
        disabled={isIgnored}
        onChange={() => onUnsubscribe(mail)}
      />
    );
  } else {
    content = (
      <span onClick={openUnsubModal} className={styles.failedToUnsubIcon}>
        <InfoIcon width="20" height="20" />
      </span>
    );
  }

  let statusContent;
  if (mail.isLoading) {
    statusContent = null;
  } else if (!isSubscribed) {
    statusContent = (
      <a
        data-status={status}
        className={styles.status}
        onClick={openUnsubModal}
      >
        See details
      </a>
    );
  } else {
    statusContent = (
      <span
        data-status={status}
        className={`${styles.status} ${styles.subscribed}`}
      >
        Subscribed
      </span>
    );
  }

  return (
    <>
      {content}
      {statusContent}
    </>
  );
}
