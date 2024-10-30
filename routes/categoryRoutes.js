const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');

// Create a category (admin only)
router.post('/', authenticateToken, authorizeRole('admin'), categoryController.createCategory);

// Get all categories (public route)
router.get('/', categoryController.getAllCategories);

// Get a category by ID (public route)
router.get('/:id', categoryController.getCategoryById);

// Update a category (admin only)
router.patch('/:id', authenticateToken, authorizeRole('admin'), categoryController.updateCategory);

// Delete a category (admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), categoryController.deleteCategory);

// Get all posts related to a category
router.get('/:categoryId/posts', authenticateToken, categoryController.getPostsByCategory);

module.exports = router;
