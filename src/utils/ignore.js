import request from './request';

export async function toggleFromIgnoreList(email, op) {
  return request('/api/me/ignore', {
    method: 'PATCH',

    body: JSON.stringify({ op, value: email })
  });
}
