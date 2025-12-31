// routes/auth.js
const express = require('express');
const authMiddleware = require( '../../middleware/authMiddleware.js');
const { me } = require( '../../controllers/authController.js');

const router = express.Router();

router.get('/me', authMiddleware, me);

module.exports =  router;