import { http } from './http';

export async function listEnrollments(params) {
  const query = new URLSearchParams(params).toString();
  console.log('listEnrollments called with params:', params);
  console.log('Generated query string:', query);
  return http(`/api/enrollments?${query}`);
}

export async function addEnrollment(data) {
  return http('/api/enrollments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteEnrollment(id) {
  return http(`/api/enrollments/${id}`, {
    method: 'DELETE',
  });
}

export async function updateGrade(id, data) {
  return http(`/api/enrollments/${id}/grade`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function uploadGradeCSV(classCode, file) {
  const formData = new FormData();
  formData.append('classCode', classCode);
  formData.append('file', file);
  return http('/api/enrollments/upload-csv', {
    method: 'POST',
    body: formData,
  });
}
