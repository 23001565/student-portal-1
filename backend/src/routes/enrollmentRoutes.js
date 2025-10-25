import express from 'express';
import { enroll } from '../controllers/enrollmentController.js';

const router = express.Router();
router.post('/enroll', enroll);

export default router;
