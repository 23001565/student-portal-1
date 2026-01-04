import { http } from './http';

export async function getAdminStudentEnrollments(params) {
  const query = new URLSearchParams(params).toString();
  return http(`/api/admin/enrollments/student?${query}`);
}
