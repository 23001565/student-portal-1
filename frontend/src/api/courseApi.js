import { http } from './http.js';

export async function listCourses({ code, majorId, curriculumCode, includeArchived } = {}) {
  const params = new URLSearchParams();
  if (code) params.set('code', code);
  if (majorId !== undefined && majorId !== '') params.set('majorId', String(majorId));
  if (curriculumCode) params.set('curriculumCode', curriculumCode);
  if (includeArchived) params.set('includeArchived', '1');
  const url = `/admin/courses${params.toString() ? `?${params.toString()}` : ''}`;
  return http(url);
}

export async function createCourse(body) {
  return http('/admin/courses', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateCourse(code, body) {
  return http(`/admin/courses/${encodeURIComponent(code)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function archiveCourse(code) {
  return http(`/admin/courses/${encodeURIComponent(code)}/archive`, { method: 'POST' });
}

export async function deleteCourse(code) {
  return http(`/admin/courses/${encodeURIComponent(code)}`, { method: 'DELETE' });
}

export async function uploadCourses(formData) {
  return http('/admin/courses/upload', { method: 'POST', body: formData });
}
