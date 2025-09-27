const express = require('express');
const { archiveOldClasses, archiveFinalizedEnrollments } = require('./archiveUtils');
const router = express.Router();

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
