const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// User registration
router.post('/register', authController.register);

// Route for email confirmation
router.get('/confirm-email/:token', authController.confirmEmail);

// User login
router.post('/login', authController.login);

// User logout
router.post('/logout', authController.logout);

// Password reset
router.post('/password-reset', authController.requestPasswordReset);
router.post('/password-reset/:token', authController.resetPassword);

module.exports = router;
