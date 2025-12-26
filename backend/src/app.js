const express = require('express');
const app = express();
const cors = require('cors');

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Routes
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/auth');

app.use('/api/admin', adminRoutes);
app.use('/auth', authRoutes);

module.exports = app;

