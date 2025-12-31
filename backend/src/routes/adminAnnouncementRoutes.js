const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/announcementController');

// Create a new announcement - admin only
router.post('/', auth, requireRole('admin'), ctrl.createAnnouncement);
// Delete a specific announcement by ID - admin only
router.delete('/:id', auth, requireRole('admin'), ctrl.deleteAnnouncement);
// Delete all announcements - admin only
router.delete('/', auth, requireRole('admin'), ctrl.deleteAllAnnouncements);

module.exports = router;