const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { getOpenCourses, submitRegistration, getProfile, getGrades } = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const enrollmentController = require('../controllers/enrollmentController');

router.use(authMiddleware); // Bảo vệ tất cả route bên dưới

router.get('/courses', getOpenCourses);
router.post('/submit', submitRegistration);
router.get('/profile', getProfile);
router.get('/grades', getGrades);
router.get('/announcements', authMiddleware, studentController.getAnnouncements);
router.get('/enrollments', authMiddleware, studentController.getMyEnrollments);
router.put('/profile', authMiddleware, studentController.updateProfile);
router.post('/enroll', authMiddleware, enrollmentController.registerClass);
router.post('/enroll/cancel', authMiddleware, enrollmentController.cancelRegistration);

module.exports = router;