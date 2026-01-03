const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const authenticate = require('../middleware/authMiddleware');

router.put('/change', authenticate, passwordController.changePassword);

module.exports = router;