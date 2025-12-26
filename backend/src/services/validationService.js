import { checkTimeConflict, checkDuplicateCourse, checkSeatAvailability } from "./redisValidationService.js";

export async function validateCourseSelection(studentId, newCourse) {
  const checks = [
    await checkDuplicateCourse(studentId, newCourse.course_id),
    await checkTimeConflict(studentId, newCourse),
    await checkSeatAvailability(newCourse.course_id)
  ];

  for (const result of checks) {
    if (!result.valid) return result;  // return first failure
  }

  return { valid: true };
}
export function validateSemesterYear(semester, year) {
  if (!semester || !year) {
    throw new Error('Semester and year are required');
  }
  if (semester < 1 || semester > 3) {
    throw new Error('Invalid semester');
  }
  if (year < 2000) {
    throw new Error('Invalid year');
  }
}

export function validateStudentUpdate(data) {
  const allowedFields = ['name', 'email', 'password'];
  Object.keys(data).forEach(key => {
    if (!allowedFields.includes(key)) {
      throw new Error(`Cannot update field: ${key}`);
    }
  });
}
