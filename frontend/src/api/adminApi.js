import { http } from './http.js';

export async function getAllRegistrationWindows() {
  return http('/api/admin/registration-windows');
}

export async function createRegistrationWindow(data) {
  return http('/api/admin/registration-windows', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRegistrationWindow(id, data) {
  return http(`/api/admin/registration-windows/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteRegistrationWindow(id) {
  return http(`/api/admin/registration-windows/${id}`, {
    method: 'DELETE',
  });
}