import { http } from './http';

export async function getStudentEnrollments(params) {
  const query = new URLSearchParams(params).toString();
  return http(`/api/student/enrollments?${query}`);
}
