(async () => {
	// self-contained module export
	const express = require('express');
	const router = express.Router();
	const { login } = require('../services/auth');

	// POST /login
	// body: { email, password, role }
	router.post('/', async (req, res) => {
		try {
			const { email, password, role } = req.body || {};
			// basic validation (auth.login will also validate)
			if (!email || !password || !role) {
				return res.status(400).json({ error: 'email, password and role are required' });
			}

			const result = await login({ email, password, role });

			// result: { token, user }
			// return token and sanitized user
			return res.status(200).json(result);
		} catch (err) {
			// map common auth errors to 401
			const msg = err && err.message ? err.message : 'Authentication failed';
			if (/[Ii]nvalid|Missing|User has no password/.test(msg)) {
				return res.status(401).json({ error: msg });
			}
			console.error('Login error:', err);
			return res.status(500).json({ error: 'Internal server error' });
		}
	});

	module.exports = router;
})();

