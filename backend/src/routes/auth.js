const express = require('express');
const router = express.Router();

// POST /auth/login -> handled by middleware/login.js
router.use('/login', require('../middleware/login'));

// Placeholder for refresh and logout endpoints (implement as needed)
router.post('/refresh', (req, res) => {
	res.status(501).json({ error: 'Not implemented' });
});

router.post('/logout', (req, res) => {
	res.status(501).json({ error: 'Not implemented' });
});

module.exports = router;

