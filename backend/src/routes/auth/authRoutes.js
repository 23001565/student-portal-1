const express = require( 'express');
const router = express.Router();
const loginController = require ('../../controllers/loginController.js');
const logoutController = require ('../../controllers/logoutController.js');
const authenticate = require ('../../middleware/authMiddleware.js');

router.post('/login', loginController.login);
router.post('/logout', authenticate, logoutController.logout);


module.exports = router;
