import { http } from './http.js';

export async function getOpenCourses(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return http(`/api/registration/classes?${qs}`);
}

export async function enrollInClass(classId) {
  return http('/api/registration/enroll', {
    method: 'POST',
    body: JSON.stringify({ classId }),
  });
}

export async function dropClass(classId) {
  return http('/api/registration/drop', {
    method: 'POST',
    body: JSON.stringify({ classId }),
  });
}

export async function getMyEnrollments() {
  return http('/api/registration/my-enrollments');
}
