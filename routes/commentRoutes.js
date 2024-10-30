const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authenticateToken = require('../middlewares/authMiddleware');

// Create a comment (authorized users only)
router.post('/:postId', authenticateToken, commentController.createComment);

// Get all comments for a post (public route)
//router.get('/:postId', commentController.getCommentsByPostId);

// Get comment data by ID
router.get('/:commentId', authenticateToken, commentController.getCommentById);

// Get all likes for a comment
router.get('/:commentId/like', authenticateToken, commentController.getCommentLikes);

// Create or update a like for a comment
router.post('/:commentId/like', authenticateToken, commentController.createOrUpdateCommentLike);

// Update a comment
router.patch('/:commentId', authenticateToken, commentController.updateComment);

// Delete a comment
router.delete('/:commentId', authenticateToken, commentController.deleteComment);

// Delete a like for a comment
router.delete('/:commentId/like', authenticateToken, commentController.deleteCommentLike);

module.exports = router;
