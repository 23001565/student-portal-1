const prisma = require('../data/prisma.js');
const { getActiveRegistrationWindow } = require('../services/courseRegistration/registrationWindowService.js');
const { getClassesForRegistration, enrollStudent, dropEnrollment, getStudentEnrollments, checkEnrollmentConflicts } = require('../services/courseRegistration/enrollmentService.js');

async function getAvailableClasses(req, res) {
  try {
    console.log('GET AVAILABLE CLASSES REQ QUERY:', req.query);
    const { curriculumId, q } = req.query; // filters
    console.log('GET AVAILABLE CLASSES REQ USER:', req.user);
    const studentId = req.user.id; // from auth middleware
    const isAdmin = req.user.role === 'admin';

    // Get active window
    const window = await getActiveRegistrationWindow();

    let filterCurriculumId = curriculumId;
    let semester, year;

    if (window) {
      semester = window.semester;
      year = window.year;
    } else {
      // Use current semester/year
      const now = new Date();
      semester = now.getMonth() < 6 ? 1 : 2; // 1 for Jan-Jun, 2 for Jul-Dec
      year = now.getFullYear();
    }


    // For students, default to their curriculum if no filter
    if (!isAdmin && !filterCurriculumId) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { curriculumId: true }
      });
      if (student.curriculumId) {
        filterCurriculumId = student.curriculumId;
      }
    }

    const classes = await getClassesForRegistration(semester, year, filterCurriculumId, q);

    // Format for frontend
    const formatted = classes.map(cls => ({
      id: cls.id,
      courseCode: cls.courseCode,
      courseName: cls.courseName,
      credits: cls.credits,
      sectionId: cls.code, // class code as sectionId
      schedule: cls.dayOfWeek ? `${cls.dayOfWeek} ${cls.startPeriod}-${cls.endPeriod}` : '',
      location: cls.location,
      capacity: cls.capacity,
      registered: cls.seatsTaken,
    }));

    res.json({ items: formatted, window: window || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function enrollInClass(req, res) {
  try {
    const { classId } = req.body;
    const studentId = req.user.id;

    // Check active window
    const window = await getActiveRegistrationWindow();
    if (!window) {
      return res.status(400).json({ error: 'No active registration window' });
    }

    // Check for conflicts
    const conflictCheck = await checkEnrollmentConflicts(studentId, classId, window.semester, window.year);
    if (!conflictCheck.success) {
      return res.status(400).json({ error: conflictCheck.message });
    }

    const result = await enrollStudent(studentId, classId, window.semester, window.year);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({ message: 'Enrolled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function dropClass(req, res) {
  try {
    const { classId } = req.body;
    const studentId = req.user.id;

    // Check active window
    const window = await getActiveRegistrationWindow();
    if (!window) {
      return res.status(400).json({ error: 'No active registration window' });
    }

    const result = await dropEnrollment(studentId, classId, window.semester, window.year);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({ message: 'Dropped successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getMyEnrollments(req, res) {
  try {
    const studentId = req.user.id;

    // Check active window
    const window = await getActiveRegistrationWindow();
    if (!window) {
      return res.json({ enrollments: [], window: null });
    }

    const enrollments = await getStudentEnrollments(studentId, window.semester, window.year);
    res.json({ enrollments, window });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
module.exports = {
  getAvailableClasses,
  enrollInClass,
  dropClass,
  getMyEnrollments,
};