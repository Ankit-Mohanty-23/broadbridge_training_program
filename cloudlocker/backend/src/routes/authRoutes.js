const express = require('express');
const { register, login, changePassword, changeUsername } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Protected profile routes
router.post('/change-password', authMiddleware, changePassword);
router.post('/change-username', authMiddleware, changeUsername);

module.exports = router;
