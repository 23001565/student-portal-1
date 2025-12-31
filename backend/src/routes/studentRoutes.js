const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/studentController');

// Student: own profile
router.get('/me', auth, requireRole('student'), ctrl.getProfile);
//router.put('/me', auth, requireRole('student'), ctrl.updateProfile);

module.exports = router;
