import { http } from './http.js';

/* ---------------- STUDENT ---------------- */

// GET /students/me
export function getMyProfile() {
  return http('/students/me');
}

// PUT /students/me
export function updateMyProfile(payload) {
  return http('/students/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/* ---------------- ADMIN ---------------- */

// GET /students
export function listStudents(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return http(`/students?${query}`);
}

// POST /students
export function createStudent(payload) {
  return http('/students', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// GET /students/:code
export function getStudent(code) {
  return http(`/students/${code}`);
}

// PUT /students/:code
export function updateStudent(code, payload) {
  return http(`/students/${code}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// DELETE /students/:code
export function deleteStudent(code) {
  return http(`/students/${code}`, {
    method: 'DELETE',
  });
}

// POST /students/:code/archive
export function archiveStudent(code) {
  return http(`/students/${code}/archive`, {
    method: 'POST',
  });
}
