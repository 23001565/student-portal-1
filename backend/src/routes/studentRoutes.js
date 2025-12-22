import express from 'express';
import {
  profile,
  updateProfile,
  myEnrollments,
  mySchedule
} from '../controllers/studentController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Thông tin cá nhân
router.get('/me', authMiddleware, profile);
router.put('/me', authMiddleware, updateProfile);

// Đăng ký & lịch học
router.get('/me/enrollments', authMiddleware, myEnrollments);
router.get('/me/schedule', authMiddleware, mySchedule);

export default router;
