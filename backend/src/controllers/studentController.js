import {
  getStudentProfile,
  // createStudent,
  updateStudentProfile,
  // deleteStudent, 
  // getAllStudents,
  // findStudentsByName,
  getStudentEnrollments,
  getStudentSchedule
} from '../services/studentService.js';

//  getStudentProfile
export async function profile(req, res) {
  try {
    const studentId = req.user.id;

    const student = await getStudentProfile(studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (err) {
    console.error('Student profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

//updateStudentProfile
export async function updateProfile(req, res) {
  try {
    const studentId = req.user.id;
    const data = req.body;

    const updated = await updateStudentProfile(studentId, data);

    res.json(updated);
  } catch (err) {
    console.error('Update student profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

// getStudentEnrollments
export async function myEnrollments(req, res) {
  try {
    const studentId = req.user.id;

    const enrollments = await getStudentEnrollments(studentId);

    res.json(enrollments);
  } catch (err) {
    console.error('Get enrollments error:', err);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
}

//getStudentSchedule
export async function mySchedule(req, res) {
  try {
    const studentId = req.user.id;
    const { semester, year } = req.query;

    const schedule = await getStudentSchedule(
      studentId,
      Number(semester),
      Number(year)
    );

    res.json(schedule);
  } catch (err) {
    console.error('Get schedule error:', err);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
}
