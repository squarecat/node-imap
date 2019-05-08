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
    return user;
  } catch (err) {
    return null;
  }
}
