import express from 'express';
import { profile } from '../controllers/studentController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authMiddleware, profile);

export default router;
