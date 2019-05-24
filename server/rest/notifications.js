import {
  getUserNotifications,
  setNotificationsReadForUser
} from '../services/user';

export default function(app, socket) {
  socket.on('notifications:fetch-unread', async userId => {
    const activity = await getUserNotifications(userId, { seen: false });
    socket.emit(userId, 'notifications', activity);
  });

  socket.on(
    'notifications:set-read',
    async (userId, { activityIds = [] } = {}) => {
      await setNotificationsReadForUser(userId, activityIds);
    }
  );
}
