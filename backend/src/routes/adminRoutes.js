const express = require('express');
const { archiveOldClasses, archiveFinalizedEnrollments } = require('./archiveUtils');
const router = express.Router();
const multer = require('multer');
const { uploadClasses } = require('../controllers/adminController');

//const upload = multer({ dest: 'uploads/' }); // saves files temporarily
// Configure multer
const storage = multer.memoryStorage(); // keeps file in memory
const upload = multer({ storage });

// POST /api/admin/upload/classes
router.post('/upload/classes', upload.single('file'), uploadClasses);

// POST /api/admin/archive
router.post('/admin/archive', async (req, res) => {
  try {
    await archiveOldClasses();
    await archiveFinalizedEnrollments();
    res.status(200).json({ message: 'Archived successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Archiving failed' });
  }
});

module.exports = router;
