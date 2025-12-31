const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/announcementController');

// List all announcements - accessible to all authenticated users
router.get('/', auth, ctrl.listAnnouncements);

module.exports = router;