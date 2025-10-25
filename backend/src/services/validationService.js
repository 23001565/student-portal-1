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
