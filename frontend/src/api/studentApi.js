import { http } from './http.js';

/* ---------------- STUDENT ---------------- */

// GET /students/me
export function getMyProfile() {
  return http('/api/students/me');
}

// GET /students/curriculum
export function getMyCurriculum() {
  return http('/api/students/curriculum');
}

/*
// PUT /students/me
export function updateMyProfile(payload) {
  return http('/students/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
*/
/* ---------------- ADMIN ---------------- */

// GET /students
export function listStudents(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return http(`/api/admin/students?${query}`);
}

// POST /students
export function createStudent(payload) {
  return http('/api/admin/students', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// GET /students/:code
export function getStudent(code) {
  return http(`/api/admin/students/${code}`);
}

// PUT /students/:code
export function updateStudent(code, payload) {
  return http(`/api/admin/students/${code}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// DELETE /students/:code
export function deleteStudent(code) {
  return http(`/api/admin/students/${code}`, {
    method: 'DELETE',
  });
}

// POST /students/:code/archive
export function archiveStudent(code) {
  return http(`/api/admin/students/${code}/archive`, {
    method: 'POST',
  });
}
