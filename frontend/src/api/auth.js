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
  console.log("API logout called");
  try {
    await http('/auth/logout', {
      method: 'POST',
    });
    console.log("API logout HTTP request completed");
  } catch (error) {
    console.error("API logout HTTP request failed:", error);
    // Ignore errors (expired cookie, etc.)
  }
}
