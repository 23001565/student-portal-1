const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middleware/uploadMiddleware');

// Students
router.get('/students', adminController.getAllStudents);
router.get('/students/:id', adminController.getStudentById); // API mới
router.post('/students', adminController.createStudent);
router.put('/students/:id', adminController.updateStudent); // API mới
router.delete('/students/:id', adminController.deleteStudent); // API mới
router.get('/stats', adminController.getDashboardStats);
router.get('/reports', adminController.getReports);
router.get('/progress', adminController.getAcademicProgress); // <--- Thêm dòng này


// Courses
router.get('/courses', adminController.getAllCourses);
router.post('/courses', adminController.createCourse);

// Classes
router.get('/classes', adminController.getAllClasses);
router.post('/classes', adminController.createClass);

// Announcements
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', adminController.createAnnouncement);

// Uploads
router.post('/grades/upload', upload.single('file'), adminController.uploadGrades);

module.exports = router;