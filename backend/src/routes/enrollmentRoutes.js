
const express = require('express');
const {
	listEnrollments,
	addEnrollment,
	deleteEnrollment,
	updateGrade,
	uploadGradeCSV,
	listStudentEnrollments,
	listAdminStudentEnrollments,
} = require('../controllers/enrollmentController.js');

const authMiddleware = require('../middleware/authMiddleware.js');
const multer = require('multer');
const upload = multer();

const router = express.Router();

// Admin: View any student's enrollments (with grade details)
router.get('/admin/student', authMiddleware, listAdminStudentEnrollments);
// Student: List their enrollments with grade details
router.get('/student', authMiddleware, listStudentEnrollments);

// List enrollments (admin)
router.get('/', authMiddleware, listEnrollments);

// Add enrollment (admin)
router.post('/', authMiddleware, addEnrollment);

// Delete enrollment (admin)
router.delete('/:id', authMiddleware, deleteEnrollment);

// Update grade for enrollment (admin)
router.put('/:id/grade', authMiddleware, updateGrade);

// Upload grade CSV for class (admin)
router.post('/upload-csv', authMiddleware, upload.single('file'), uploadGradeCSV);

module.exports = router;