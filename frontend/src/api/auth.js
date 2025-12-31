import { http } from './http.js';

export async function me() {
  return http('/auth/me');
}

export async function login({ email, password, role }) {
  return http('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });

  // No token handling here since it's in HttpOnly cookie
  //return data.user;
}

export async function logout() {
  try {
    await http('/auth/logout', {
      method: 'POST',
    });
  } catch {
    // Ignore errors (expired cookie, etc.)
  }
}
