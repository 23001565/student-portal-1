const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/classController');

const requireAdmin = requireRole('admin');

// List / filter classes
router.get('/', auth, requireAdmin, ctrl.list);

// Create class
router.post('/', auth, requireAdmin, express.json(), ctrl.create);

// Update class (by code + semester + year)
router.patch('/:code/:semester/:year', auth, requireAdmin, express.json(), ctrl.update);

// Archive class
router.post('/:code/:semester/:year/archive', auth, requireAdmin, ctrl.archive);

// Delete class
router.delete('/:code/:semester/:year', auth, requireAdmin, ctrl.remove);

// Upload classes from CSV
router.post('/upload', auth, requireAdmin, ctrl.uploadMiddleware, ctrl.uploadCSV);

module.exports = router;
