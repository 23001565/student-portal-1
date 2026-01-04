import { http } from './http';

export async function listEnrollments(params) {
  const query = new URLSearchParams(params).toString();
  console.log('listEnrollments called with params:', params);
  console.log('Generated query string:', query);
  return http(`/api/admin/enrollments?${query}`);
}

export async function addEnrollment(data) {
  return http('/api/admin/enrollments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteEnrollment(id) {
  return http(`/api/admin/enrollments/${id}`, {
    method: 'DELETE',
  });
}

export async function updateGrade(id, data) {
  return http(`/api/admin/enrollments/${id}/grade`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function uploadGradeCSV(classCode, file) {
  const formData = new FormData();
  formData.append('classCode', classCode);
  formData.append('file', file);
  return http('/api/admin/enrollments/upload-csv', {
    method: 'POST',
    body: formData,
  });
}
