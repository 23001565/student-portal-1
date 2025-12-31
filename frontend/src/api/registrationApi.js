import { http } from './http.js';

export async function getOpenCourses(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return http(`/admin/registration/courses?${qs}`);
}

export async function submitRegistration(payload) {
  return http('/admin/registration/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
