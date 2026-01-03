const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/studentRegistrationController');

// Student and Admin: course registration preview
router.get('/classes', auth, requireRole('student', 'admin'), ctrl.getAvailableClasses);
router.post('/enroll', auth, requireRole('student'), ctrl.enrollInClass);
router.post('/drop', auth, requireRole('student'), ctrl.dropClass);
router.get('/my-enrollments', auth, requireRole('student'), ctrl.getMyEnrollments);

module.exports = router;