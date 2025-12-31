const express = require ('express');
const cookieParser = require ('cookie-parser');
const cors = require('cors');

const authRoutes = require ('./routes/auth/authRoutes.js');
//const adminRoutes =  require('./routes/adminRoutes.js');
const studentRoutes = require ('./routes/studentRoutes.js');
//const enrollmentRoutes = require('./routes/enrollmentRoutes.js');
const classRoutes = require ('./routes/classRoutes.js');
const curriculumRoutes = require ('./routes/curriculumRoutes.js');
const courseRoutes = require ('./routes/courseRoutes.js');
const auth = require('./routes/auth/auth.js');

const app = express();

//console.log('DB:', process.env.DATABASE_URL);


app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json()); //  BEFORE routes
app.use(express.urlencoded({ extended: true }));


app.use('/auth', auth);




/**
 * Routes
 */

//app.use('/api/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/api/students', studentRoutes);
//app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/admin/curriculum', curriculumRoutes);
app.use('/api/admin/courses', courseRoutes);


app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;










