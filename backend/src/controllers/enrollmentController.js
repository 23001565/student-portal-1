import { reserveSeat } from "../services/enrollmentService.js";
import { validateCourseSelection } from "../services/validationService.js";
import { getStudentClasses } from "../services/registrationService";

export async function getRegistrationPage(req, res) {
  const { studentId } = req.user;
  const { curriculumId, term, year } = req.query;

  const classes = await getStudentClasses(studentId, curriculumId, term, year);
  res.json({ classes });
}

export async function saveEnrollment(req, res) {
  const { courseId } = req.body;
  const studentId = req.user.id;

  const validation = await validateCourseSelection(studentId, { course_id: courseId });
  if (!validation.valid) {
    return res.status(400).json({ success: false, message: validation.message });
  }

  const seat = await reserveSeat(courseId);
  if (!seat.success) {
    return res.status(400).json({ success: false, message: seat.message });
  }

  // If both valid and reserved successfully → save enrollment in DB
  await db.query(
    "INSERT INTO enrollments (student_id, course_id, status) VALUES ($1, $2, 'submitted')",
    [studentId, courseId]
  );

  res.status(200).json({ success: true });
}




