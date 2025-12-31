import { http } from './http.js';

export async function getStudentProgress(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return http(`/admin/progress?${qs}`);
}
