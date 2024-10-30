const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');

// Get all posts
router.get('/', authenticateToken, postController.getAllPosts);

// Get user's saved posts
router.get('/saved', authenticateToken, postController.getSavedPosts);

// Get a post by ID
router.get('/:postId', postController.getPostById);

// Get comments for a post
router.get('/:postId/comments', postController.getCommentsByPostId);

// Create a comment for a post
router.post('/:postId/comments', authenticateToken, postController.createComment);

// Get all categories related to a post
router.get('/:postId/categories', postController.getCategoriesByPostId);

// Get all likes for a post
router.get('/:postId/like', postController.getLikesByPostId);

// Create a post
router.post('/', authenticateToken, postController.createPost);

// Add a like to a post
router.post('/:postId/like', authenticateToken, postController.likePost);

// Update a post
router.patch('/:postId', authenticateToken, postController.updatePost);

// Delete a post (accessible to admin and post author)
router.delete('/:postId', authenticateToken, postController.deletePost);

// Remove a like from a post
router.delete('/:postId/like', authenticateToken, postController.unlikePost);

router.patch('/:postId/status', authenticateToken, postController.updatePostStatus);

//router.get('/filter', authenticateToken, postController.getFilteredAndSortedPosts);

// Save a post
router.post('/:postId/save', authenticateToken, postController.savePost);

// Remove a saved post
router.delete('/:postId/save', authenticateToken, postController.removeSavedPost);

module.exports = router;
