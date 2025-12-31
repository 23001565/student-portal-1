import { http } from './http.js';

export function uploadCurriculum(formData) {
  return http('/api/admin/curriculum/upload', {
    method: 'POST',
    body: formData,
  });
}

export function updateCurriculum(code, formData) {
  return http(`/api/admin/curriculum/${encodeURIComponent(code)}`, {
    method: 'PATCH',
    body: formData,
  });
}

export function archiveCurriculum(code) {
  return http(`/api/admin/curriculum/${encodeURIComponent(code)}/archive`, {
    method: 'POST',
  });
}

export function deleteCurriculum(code) {
  return http(`/api/admin/curriculum/${encodeURIComponent(code)}`, {
    method: 'DELETE',
  });
}

export function cloneCurriculum(body) {
  return http('/api/admin/curriculum/clone', {
    method: 'POST',
    body,
  });
}

export function getCurriculumByCode(code) {
  return http(`/api/admin/curriculum/${encodeURIComponent(code)}`);
}

export function listCurricula(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return http(`/api/admin/curriculum${qs ? `?${qs}` : ''}`);
}
