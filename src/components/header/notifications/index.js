import './notifications.module.scss';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { BellIcon } from '../../../components/icons';
import { Link } from 'gatsby';
import cx from 'classnames';
import { parseActivity } from '../../../utils/activities';
import useSocket from '../../../utils/hooks/use-socket';
import useUser from '../../../utils/hooks/use-user';

const Notifications = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [{ token, id }] = useUser(u => ({
    id: u.id,
    token: u.token,
    unreadNotifications: u.unreadNotifications
  }));
  const { isConnected, socket, emit, error } = useSocket({
    token,
    userId: id
  });

  // socket setup when connected
  useEffect(
    () => {
      async function onNotification(data) {
        try {
          console.log('notifications', data);
          // remove jank
          requestAnimationFrame(() => onNotifications(data));
        } catch (err) {
          console.error(err);
        }
      }
      if (isConnected) {
        console.log('listen');
        socket.on('notifications', onNotification);
        emit('notifications:fetch-unread');
      }

      return () => {
        if (socket) {
          console.log('stop listen');
          socket.off('notifications', onNotification);
        }
      };
    },
    [isConnected, error, socket, onNotifications, emit]
  );

  const onNotifications = useCallback(
    data => {
      const updated = [
        ...notifications.filter(n => !data.find(d => d.id === n.id)),
        ...data
      ];
      setNotifications(updated);
    },
    [notifications]
  );

  const onDropdownOpen = () => {
    setShowSettings(!showSettings);
  };

  const onDropdownClose = useCallback(
    () => {
      setShowSettings(false);
      if (notifications.length) {
        socket.emit('notifications:set-read');
      }
      setNotifications([]);
    },
    [notifications.length, socket]
  );

  const unread = notifications.filter(n => !n.notificationSeen).length;

  const onClickBody = useCallback(
    ({ target }) => {
      let { parentElement } = target;
      if (!parentElement) return;
      while (parentElement && parentElement !== document.body) {
        if (parentElement.classList.contains('settings-dropdown-toggle')) {
          return;
        }
        parentElement = parentElement.parentElement;
      }
      onDropdownClose();
    },
    [onDropdownClose]
  );

  useEffect(
    () => {
      if (showSettings) {
        document.body.addEventListener('click', onClickBody);
      } else {
        document.body.removeEventListener('click', onClickBody);
      }
      return () => document.body.removeEventListener('click', onClickBody);
    },
    [onClickBody, showSettings]
  );

  const notificationsContent = useMemo(
    () => {
      if (!notifications.length) {
        return (
          <li styleName="notification-item empty">
            <p>
              No new notifications!{' '}
              <span role="img" aria-label="Tada">
                🎉
              </span>
            </p>
          </li>
        );
      }
      return notifications.map(n => (
        <li key={n.id} styleName="notification-item">
          <span
            styleName={cx('notification', {
              unread: !n.notificationSeen
            })}
          >
            {parseActivity(n)}
          </span>
        </li>
      ));
    },
    [notifications]
  );

  return (
    <div styleName="notifications">
      <button
        styleName={cx('btn', { unread: unread })}
        data-count={unread}
        onClick={onDropdownOpen}
      >
        <div styleName="notification-icon">
          <BellIcon width="20" height="20" />
        </div>
      </button>
      <ul styleName={`notifications-list ${showSettings ? 'shown' : ''}`}>
        {notificationsContent}
        <li styleName="view-all-link">
          <Link to="/app/profile/history/notifications">
            View all notifications
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Notifications;
