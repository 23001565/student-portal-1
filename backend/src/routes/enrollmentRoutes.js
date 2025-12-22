import express from 'express';
import { enroll, withdraw } from '../controllers/enrollmentController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

/**
 * Sinh viên đăng ký lớp
 * POST /enrollments
 */
router.post('/', authMiddleware, enroll);

/**
 * Sinh viên hủy đăng ký lớp
 * DELETE /enrollments/:classId
 */
router.delete('/:classId', authMiddleware, withdraw);

export default router;
