import { http } from './http';

export async function getStudentEnrollments(params) {
  const query = new URLSearchParams(params).toString();
  return http(`/api/enrollments/student?${query}`);
}
