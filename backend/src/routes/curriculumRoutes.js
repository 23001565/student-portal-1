const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const {
  uploadFieldsParser,
  uploadCurriculumController,
  updateCurriculumController,
  archiveCurriculumController,
  deleteCurriculumController,
  cloneCurriculumController,
  getCurriculumByCodeController,
  listCurriculaController,
} = require('../controllers/curriculumController');

// Protect all with admin role
const requireAdmin = requireRole('admin');

// List/filter curricula
router.get('/', auth, requireAdmin, listCurriculaController);

// Get one curriculum by code (with tree)
router.get('/:code', auth, requireAdmin, getCurriculumByCodeController);

// Create new curriculum from structured payload
router.post('/upload', auth, requireAdmin, uploadFieldsParser, uploadCurriculumController);

// Update existing curriculum by code (replace tree)
router.patch('/:code', auth, requireAdmin, uploadFieldsParser, updateCurriculumController);

// Archive an existing curriculum by code
router.post('/:code/archive', auth, requireAdmin, archiveCurriculumController);

// Delete an existing curriculum by code
router.delete('/:code', auth, requireAdmin, deleteCurriculumController);

// Clone an existing curriculum into new code
router.post('/clone', auth, requireAdmin, express.urlencoded({ extended: true }), cloneCurriculumController);

module.exports = router;
