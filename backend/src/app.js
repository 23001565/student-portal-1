//const express = require('express');
//const app = express();
// const adminRoutes = require('./routes/adminRoutes');

// app.use('/api/admin', adminRoutes);

// module.exports = app;

import express from 'express';

import adminRoutes from './routes/adminRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import classRoutes from './routes/classRoutes.js';

const app = express();

/**
 * Global middleware
 */
app.use(express.json());

/**
 * Routes
 */
app.use('/api/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/classes', classRoutes);



export default app;
