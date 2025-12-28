
import express from 'express';
import { mySchedule } from '../controllers/scheduleController.js';
import initRedisSession from '../middleware/initRedisSession.js';

const router = express.Router();

router.get('/me/schedule', initRedisSession, mySchedule);

export default router;
