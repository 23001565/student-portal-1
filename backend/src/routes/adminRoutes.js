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
router.get('/majors', adminController.getAllMajors);
router.get('/curriculums', adminController.getAllCurriculums);

// Classes
router.get('/classes', adminController.getAllClasses);
router.post('/classes', adminController.createClass);
router.post('/registration-period', adminController.setRegistrationPeriod);
router.put('/classes/:id/status', adminController.toggleClassStatus);
router.delete('/classes/:id', adminController.deleteClass);
router.get('/registration-period', adminController.getRegistrationConfig);

// Announcements
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.put('/announcements/:id', adminController.updateAnnouncement); // API Sửa
router.delete('/announcements/:id', adminController.deleteAnnouncement); // API Xóa

// Uploads
router.post('/grades/upload', upload.single('file'), adminController.uploadGrades);

module.exports = router;