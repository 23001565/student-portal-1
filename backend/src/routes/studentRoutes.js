import express from 'express';
import {
  profile,
  updateProfile,
  myEnrollments,
  mySchedule
} from '../controllers/studentController.js';
import initRedisSession from '../middleware/initRedisSession.js';

const router = express.Router();

// Thông tin cá nhân
router.get('/me', initRedisSession, profile);
router.put('/me', initRedisSession, updateProfile);

// Đăng ký & lịch học
router.get('/me/enrollments', initRedisSession, myEnrollments);
router.get('/me/schedule', initRedisSession, mySchedule);

export default router;
