import request from './request';

let isPaymentRedirectNow = false;
if (typeof URLSearchParams !== 'undefined' && typeof window !== 'undefined') {
  isPaymentRedirectNow = new URLSearchParams(window.location.search).get(
    'doScan'
  );
}

export function isPaymentRedirect() {
  return isPaymentRedirectNow;
}

export function setUser(user) {
  return localStorage.setItem('user', JSON.stringify(user));
}

export function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}

export async function isLoggedIn() {
  if (!localStorage.getItem('user')) {
    await fetchLoggedInUser();
  }
  return !!localStorage.getItem('user');
}

export function logout() {
  return localStorage.clear();
}

export async function fetchLoggedInUser() {
  try {
    const user = await request('/api/me', {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
    localStorage.setItem('fetched-user', true);
    localStorage.setItem('user', JSON.stringify(user));
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
