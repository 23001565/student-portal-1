const { getActiveRegistrationWindow, getStudentActiveRegistrationWindow } = require('../services/courseRegistration/registrationWindowService.js');
const { getClassesForRegistration, enrollStudent, dropEnrollment, getStudentEnrollments, checkEnrollmentConflicts, getCurriculumIdForStudent, getStudentId } = require('../services/courseRegistration/enrollmentService.js');

async function getAvailableClasses(req, res) {
  try {
    console.log('GET AVAILABLE CLASSES REQ QUERY:', req.query);
    const { curriculumId, q } = req.query; // filters
    console.log('GET AVAILABLE CLASSES REQ USER:', req.user);
    const studentId = req.user.id; // from auth middleware
    const isAdmin = req.user.role === 'admin';
    console.log('STUDENT ID:', studentId);
    console.log('IS ADMIN:', isAdmin);

    // Get active window
    let window;
    if (isAdmin) {
      window = await getActiveRegistrationWindow();
    } else {
      window = await getStudentActiveRegistrationWindow();
    }
    console.log('Active registration window:', window);
    console.log('WINDOW DETAILS:', window ? { id: window.id, semester: window.semester, year: window.year, startTime: window.startTime, endTime: window.endTime, isActive: window.isActive } : null);

    let filterCurriculumId = curriculumId;
    // Fix: treat 'null' string as null
    if (filterCurriculumId === 'null') filterCurriculumId = null;
    if (filterCurriculumId === "my-curriculum" ) {
      // Get student's curriculumId
      filterCurriculumId = await getCurriculumIdForStudent(studentId);
      console.log('Derived curriculumId for student:', filterCurriculumId);
    }

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

    console.log('Filtering classes for curriculumId:', filterCurriculumId, 'semester:', semester, 'year:', year, 'role:', req.user.role);

    const classes = await getClassesForRegistration(semester, year, filterCurriculumId, q);

    const dayName = (d) =>
    ["?", "CN", "T2", "T3", "T4", "T5", "T6", "T7"][d] || "?";
    // Format for frontend
    const formatted = classes.map(cls => ({
      id: cls.id,
      courseCode: cls.courseCode,
      courseName: cls.courseName,
      credits: cls.credits,
      sectionId: cls.code, // class code as sectionId
      schedule: cls.dayOfWeek ? `${dayName(cls.dayOfWeek)} (${cls.startPeriod}-${cls.endPeriod})` : '',
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
    console.log('ENROLL IN CLASS REQ BODY:', req.body);
    console.log('ENROLL IN CLASS REQ USER:', req.user);

    const { classId } = req.body;
    const studentId = await getStudentId(req.user.id);

    console.log('STUDENT ID:', studentId);

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