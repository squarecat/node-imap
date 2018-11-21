export function setUser(user) {
  return localStorage.setItem('user', user);
}

export function getUser() {
  return localStorage.getItem('user');
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
  const resp = await fetch('/api/me');
  const user = resp.json();
  localStorage.setItem('fetched-user', true);
  localStorage.setItem('user', user);
  return user;
}
