
const {
  adminListEnrollments,
  getStudentId,
  adminAddEnrollment,
  adminDeleteEnrollment,
  adminUpdateGrade,
  adminUploadGradeCSV,
  studentListEnrollments,
  adminStudentEnrollments,
} = require('../services/courseRegistration/enrollmentService.js');
// Admin: View any student's enrollments (with grade details)
async function listAdminStudentEnrollments(req, res) {
  try {
    const { studentCode, semester, year, courseCode, classCode } = req.query;
    const studentCodeNum = Number(studentCode);
    if (isNaN(studentCodeNum)) {
      return res.status(400).json({ error: 'studentCode must be a number' });
    }
    const enrollments = await adminStudentEnrollments({ studentCode: studentCodeNum, semester, year, courseCode, classCode });
    res.json({ items: enrollments });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}
// Student: List their enrollments with grade details
async function listStudentEnrollments(req, res) {
  try {
    console.log('listStudentEnrollments called for user:', req.user);
    const studentId = await getStudentId(req.user.id);
    console.log('Resolved studentId:', studentId);
    console.log('Query params:', req.query);
    const { semester, year, courseCode, classCode } = req.query;
    const enrollments = await studentListEnrollments({ studentId, semester, year, courseCode, classCode });
    res.json({ items: enrollments });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

// List enrollments (admin)
async function listEnrollments(req, res) {
  try {
    const { semester, year, classCode, courseCode, studentCode, status } = req.query;
    console.log('listEnrollments called with params:', req.query);
    const enrollments = await adminListEnrollments({ semester, year, classCode, courseCode, studentCode, status });
    res.json({ items: enrollments });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Add enrollment (admin)
async function addEnrollment(req, res) {

  try {
    console.log('addEnrollment called with body:', req.body);
    const { classCode, studentCode } = req.body;
    const studentCodeNum = Number(studentCode);
    if (isNaN(studentCodeNum)) {
      return res.status(400).json({ error: 'studentCode must be a number' });
    }
    const enrollment = await adminAddEnrollment({ classCode, studentCode: studentCodeNum });
    res.json({ item: enrollment });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

// Delete enrollment (admin)
async function deleteEnrollment(req, res) {
  try {
    const { id } = req.params;
    await adminDeleteEnrollment(Number(id));
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

// Update grade for enrollment (admin)
async function updateGrade(req, res) {
  try {
    const { id } = req.params;
    const { midTerm, finalExam, total10Scale } = req.body;
    const updated = await adminUpdateGrade(Number(id), {
      midTerm: Number(midTerm),
      finalExam: Number(finalExam),
      total10Scale: Number(total10Scale)
    });
    res.json({ item: updated });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

// Upload grade CSV for class (admin)
async function uploadGradeCSV(req, res) {
  try {
    const { classCode } = req.body;
    const csvText = req.file ? req.file.buffer.toString() : req.body.csvText;
    const results = await adminUploadGradeCSV(classCode, csvText);
    res.json({ items: results });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

module.exports = {
  listEnrollments,
  addEnrollment,
  deleteEnrollment,
  updateGrade,
  uploadGradeCSV,
  listStudentEnrollments,
  listAdminStudentEnrollments,
};



