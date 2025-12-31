import { http } from './http.js';

export async function uploadGrades(formData) {
  // Stub endpoint - replace with real API
  return http('/api/admin/grades/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function validateGradesMapping(mapping) {
  // Optional validation step for mapping columns
  return http('/api/admin/grades/validate-mapping', {
    method: 'POST',
    body: JSON.stringify(mapping),
  });
}
