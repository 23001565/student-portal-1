import { http } from './http.js';

export async function changePassword({ oldPassword, newPassword }) {
  return http('/api/password/change', {
    method: 'PUT',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}
