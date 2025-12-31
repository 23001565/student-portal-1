const express = require('express');
const router = express.Router();
const { uploadGrades, getAnnouncements } = require('../controllers/adminController');
const upload = require('../middleware/uploadMiddleware');

router.post('/grades/upload', upload.single('file'), uploadGrades);
router.get('/announcements', getAnnouncements);

module.exports = router;