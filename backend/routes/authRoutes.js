const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');

// @route   POST /api/login
// @desc    Log in user
// @access  Public
router.post('/login', loginUser);

module.exports = router;
