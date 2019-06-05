import request from './request';

export async function toggleFromIgnoreList(email, op) {
  return request('/api/me/ignore', {
    method: 'PATCH',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ op, value: email })
  });
}
