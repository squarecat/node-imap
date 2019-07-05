import request from './request';

export async function fetchLoggedInUser() {
  try {
    const user = await request('/api/me', {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
    window.intergramOnOpen = {
      userData: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider
      },
      userId: user.id,
      private: true
    };
    // if there is an active chat id then we want to replace it with
    // the real user id now, but make it clear that the chat is the same
    localStorage.setItem('userId', user.id);
    return user;
  } catch (err) {
    return null;
  }
}
