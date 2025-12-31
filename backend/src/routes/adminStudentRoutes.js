const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/studentController');

// Admin: manage students
router.get('/', auth, requireRole('admin'), ctrl.list);
router.post('/', auth, requireRole('admin'), ctrl.create);
router.get('/:code', auth, requireRole('admin'), ctrl.getProfile);
router.put('/:code', auth, requireRole('admin'), ctrl.updateProfile);
router.delete('/:code', auth, requireRole('admin'), ctrl.remove);
router.post('/:code/archive', auth, requireRole('admin'), ctrl.archive);

module.exports = router;