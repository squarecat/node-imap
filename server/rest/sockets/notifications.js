import {
  getUserNotifications,
  setNotificationsReadForUser
} from '../../services/user';

export async function fetchUnreadNotifications(socket, userId) {
  const activity = await getUserNotifications(userId, { seen: false });
  return socket.emit('notifications', activity);
}

export async function setNotificationsRead(
  socket,
  userId,
  { activityIds = [] } = {}
) {
  await setNotificationsReadForUser(userId, activityIds);
}
