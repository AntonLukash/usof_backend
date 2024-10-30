const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRole('admin'), userController.getAllUsers);

// Get user data by ID
router.get('/:userId', authenticateToken, userController.getUserById);

// Create a user (only admins can create new users)
router.post('/', authenticateToken, authorizeRole('admin'), userController.createUser);

// Update user avatar
router.patch('/avatar', authenticateToken, upload, userController.updateAvatar);

// Update user data (admin only)
router.patch('/:userId', authenticateToken, authorizeRole('admin'), userController.updateUserData);

// Delete a user (admin only)
router.delete('/:userId', authenticateToken, authorizeRole('admin'), userController.deleteUser);

module.exports = router;
