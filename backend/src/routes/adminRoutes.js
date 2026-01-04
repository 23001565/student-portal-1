const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middleware/uploadMiddleware');
const enrollmentController = require('../controllers/enrollmentController');

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
router.post('/config/registration-period', adminController.setRegistrationPeriod);
router.get('/config/registration-period', async (req, res) => {
    // Viết nhanh logic lấy config tại đây hoặc chuyển vào controller
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try {
        const config = await prisma.systemConfig.findUnique({
            where: { key: 'REGISTRATION_PERIOD' }
        });
        res.json(config || {}); 
    } catch (err) { res.status(500).json({error: err.message}) }
});

// Classes
router.get('/classes', adminController.getAllClasses);
router.post('/classes', adminController.createClass);
router.post('/registration-period', adminController.setRegistrationPeriod);
router.put('/classes/:id/status', adminController.toggleClassStatus);
router.delete('/classes/:id', adminController.deleteClass);
router.get('/registration-period', adminController.getRegistrationConfig);
router.delete('/courses/:id', adminController.deleteCourse);

// Announcements
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.put('/announcements/:id', adminController.updateAnnouncement); // API Sửa
router.delete('/announcements/:id', adminController.deleteAnnouncement); // API Xóa

// Uploads
router.post('/grades/upload', upload.single('file'), adminController.uploadGrades);
router.get('/classes/:classId/grades', adminController.getClassEnrollments); // Lấy bảng điểm lớp
router.put('/grades/update', adminController.updateGrade); // Lưu điểm
router.delete('/enrollments/:id', enrollmentController.deleteEnrollmentByAdmin);

module.exports = router;