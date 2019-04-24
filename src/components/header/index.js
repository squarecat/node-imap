import './header.module.scss';

import { ClockIcon } from '../../components/icons';
import { Link } from 'gatsby';
import React from 'react';
import SettingsDropdown from './settings-dropdown';
import useUser from '../../utils/hooks/use-user';

const logoUrl = `${process.env.CDN_URL}/images/meta/logo.png`;

export default ({ loaded, onClickReminder, onClickReferral }) => {
  const [{ lastPaidScanType, reminder }] = useUser(
    ({ lastPaidScanType, reminder }) => ({
      lastPaidScanType,
      reminder
    })
  );

  let reminderButton = null;

  const isLastSearchPaid = !!lastPaidScanType;
  const hasReminder = reminder && !reminder.sent;

  if (isLastSearchPaid && !hasReminder) {
    reminderButton = (
      <button styleName="header-btn" onClick={() => onClickReminder()}>
        <ClockIcon />
        <span styleName="header-btn-text header-btn-text--short">Remind</span>
        <span styleName="header-btn-text header-btn-text--long">
          Set reminder
        </span>
      </button>
    );
  } else if (hasReminder) {
    reminderButton = (
      <button
        styleName="header-btn only-icon"
        onClick={() => onClickReminder()}
      >
        <ClockIcon />
      </button>
    );
  }

  return (
    <div styleName={`header ${loaded ? 'loaded' : ''}`}>
      <Link to="/app/" styleName="header-logo">
        <img alt="logo" src={logoUrl} />
      </Link>
      <div styleName="header-title">Leave Me Alone </div>
      <div styleName="header-actions">
        {reminderButton}
        <button styleName="header-btn" onClick={() => onClickReferral()}>
          <span styleName="header-btn-text header-btn-text--short">Refer</span>
          <span styleName="header-btn-text header-btn-text--long">
            Refer a friend
          </span>
        </button>
        <SettingsDropdown onClickSupport={() => openChat()} />
      </div>
    </div>
  );
};

function openChat(message = '') {
  if (window.$crisp) {
    window.$crisp.push(['do', 'chat:show']);
    window.$crisp.push(['do', 'chat:open']);
    window.$crisp.push(['set', 'message:text', [message]]);
    window.$crisp.push(['on', 'chat:closed', closeChat]);
  }
}

function closeChat() {
  if (window.$crisp) {
    window.$crisp.push(['do', 'chat:hide']);
  }
}
