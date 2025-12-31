const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/courseController');

const requireAdmin = requireRole('admin');

router.get('/', auth, requireAdmin, ctrl.list);
router.post('/', auth, requireAdmin, express.json(), ctrl.create);
router.patch('/:code', auth, requireAdmin, express.json(), ctrl.update);
router.post('/:code/archive', auth, requireAdmin, ctrl.archive);
router.delete('/:code', auth, requireAdmin, ctrl.remove);

// Upload courses from CSV
router.post('/upload', auth, requireAdmin, ctrl.uploadMiddleware, ctrl.uploadCSV);

module.exports = router;
