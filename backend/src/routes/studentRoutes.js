const express = require('express');
const router = express.Router();
const { getOpenCourses, submitRegistration, getProfile, getGrades } = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // Bảo vệ tất cả route bên dưới

router.get('/courses', getOpenCourses);
router.post('/submit', submitRegistration);
router.get('/profile', getProfile);
router.get('/grades', getGrades);

module.exports = router;