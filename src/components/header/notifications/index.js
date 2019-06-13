import './notifications.module.scss';

import React, { useEffect, useState } from 'react';

import { BellIcon } from '../../../components/icons';
import { Link } from 'gatsby';
import cx from 'classnames';
import { parseActivity } from '../../../utils/activities';
import useSocket from '../../../utils/hooks/use-socket';
import useUser from '../../../utils/hooks/use-user';

export default () => {
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [{ token, id }] = useUser(u => ({
    id: u.id,
    token: u.token,
    unreadNotifications: u.unreadNotifications
  }));
  const { isConnected, socket, error } = useSocket({
    token,
    userId: id
  });

  // socket setup when connected
  useEffect(
    () => {
      if (isConnected) {
        socket.on('notifications', async data => {
          try {
            console.log('notifications', data);
            onNotifications(data);
          } catch (err) {
            console.error(err);
          }
        });
        socket.emit('notifications:fetch-unread');
      }
    },
    [isConnected, error]
  );

  function onNotifications(data) {
    const updated = [
      ...notifications.filter(n => !data.find(d => d.id === n.id)),
      ...data
    ];
    setNotifications(updated);
  }

  const onDropdownOpen = () => {
    setShowSettings(!showSettings);
  };

  const onDropdownClose = () => {
    setShowSettings(false);
    if (notifications.length) {
      socket.emit('notifications:set-read');
    }
    setNotifications([]);
  };

  const unread = notifications.filter(n => !n.notification.seen).length;

  const onClickBody = ({ target }) => {
    let { parentElement } = target;
    if (!parentElement) return;
    while (parentElement && parentElement !== document.body) {
      if (parentElement.classList.contains('settings-dropdown-toggle')) {
        return;
      }
      parentElement = parentElement.parentElement;
    }
    onDropdownClose();
  };

  useEffect(
    () => {
      if (showSettings) {
        document.body.addEventListener('click', onClickBody);
      } else {
        document.body.removeEventListener('click', onClickBody);
      }
      return () => document.body.removeEventListener('click', onClickBody);
    },
    [showSettings]
  );

  return (
    <div styleName="notifications">
      <button
        styleName={cx('btn', { unread: unread })}
        data-count={unread}
        onClick={() => onDropdownOpen()}
      >
        <div styleName="notification-icon">
          <BellIcon width="20" height="20" />
        </div>
      </button>
      <ul styleName={`notifications-list ${showSettings ? 'shown' : ''}`}>
        {notifications.map(n => (
          <li key={n.id} styleName="notification-item">
            <span
              styleName={cx('notification', {
                unread: !n.notification.seen
              })}
            >
              {parseActivity(n)}
            </span>
          </li>
        ))}
        {notifications.length ? null : (
          <li styleName="notification-item">
            You have no unread notifications
          </li>
        )}
        <li styleName="view-all-link">
          <Link to="/app/profile/history/notifications">
            View all notifications
          </Link>
        </li>
      </ul>
    </div>
  );
};
