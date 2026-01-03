const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/registrationWindowController');

// Admin: manage registration windows
router.get('/', auth, requireRole('admin'), ctrl.getAllWindows);
router.post('/', auth, requireRole('admin'), ctrl.createWindow);
router.put('/:id', auth, requireRole('admin'), ctrl.updateWindow);
router.delete('/:id', auth, requireRole('admin'), ctrl.deleteWindow);

// Public: get active window (for students)
router.get('/active', ctrl.getActiveWindow);

module.exports = router;