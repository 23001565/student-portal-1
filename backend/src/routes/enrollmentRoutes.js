import express from 'express';
import { enroll, withdraw } from '../controllers/enrollmentController.js';
import initRedisSession from '../middleware/initRedisSession.js';

const router = express.Router();

router.post('/', authMiddleware, enroll);

router.delete('/:classId', authMiddleware, withdraw);

export default router;
