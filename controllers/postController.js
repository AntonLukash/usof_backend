const postModel = require('../models/post');

const getAllPosts = async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;
        const { sort = 'likes', category, dateStart, dateEnd, status } = req.query;

        const posts = userRole === 'admin'
            ? await postModel.getAllPosts({ sort, category, dateStart, dateEnd, status })
            : await postModel.getUserAccessiblePosts(userId, { sort, category, dateStart, dateEnd, status });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Error when receiving posts' });
    }
};

const getPostById = async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await postModel.getPostById(postId);
        
        if (!post) return res.status(404).json({ error: 'Post not found' });
        
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Error receiving post' });
    }
};

const getCommentsByPostId = async (req, res) => {
    try {
        const postId = req.params.postId;
        const comments = await postModel.getCommentsByPostId(postId);
        
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Error receiving comments' });
    }
};

const createPost = async (req, res) => {
    try {
        const { title, content, categories } = req.body;
        const authorId = req.user.userId;

        await postModel.createPost({ authorId, title, content, categories });
        res.status(201).json({ message: 'Post successfully created' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating post' });
    }
};

const updatePost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const { title, content, categories, status } = req.body;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const post = await postModel.getPostById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const isAuthor = post.author_id === userId;

        if (isAuthor) {
            await postModel.updatePost(postId, { title, content, categories, status });
            res.json({ message: 'Post successfully updated' });
        } else if (userRole === 'admin') {
            await postModel.updatePost(postId, { categories, status });
            res.json({ message: 'Post status updated successfully' });
        } else {
            res.status(403).json({ error: 'You do not have permission to edit this post' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Post update error' });
    }
};

const deletePost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const post = await postModel.getPostById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        if (post.author_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ error: 'You do not have permission to delete this post' });
        }

        await postModel.deletePost(postId);
        res.json({ message: 'Post successfully deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error when deleting post' });
    }
};

const getCategoriesByPostId = async (req, res) => {
    try {
        const postId = req.params.postId;
        const categories = await postModel.getCategoriesByPostId(postId);
        
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Error getting categories' });
    }
};

const createComment = async (req, res) => {
    try {
        const postId = req.params.postId;
        const { content } = req.body;
        const authorId = req.user.userId;

        await postModel.createComment({ postId, authorId, content });
        res.status(201).json({ message: 'Comment added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating comment' });
    }
};

const getLikesByPostId = async (req, res) => {
    try {
        const postId = req.params.postId;
        const likes = await postModel.getLikesByPostId(postId);
        
        res.json(likes);
    } catch (error) {
        res.status(500).json({ error: 'Error when receiving likes' });
    }
};

const likePost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user.userId;
        const { type } = req.body;

        await postModel.addLike({ postId, userId, type });
        res.json({ message: 'Like added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Error adding a like' });
    }
};

const unlikePost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user.userId;

        await postModel.removeLike({ postId, userId });
        res.json({ message: 'Like removed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error when deleting a like' });
    }
};

const updatePostStatus = async (req, res) => {
    try {
        const postId = req.params.postId;
        const { status } = req.body;
        const userId = req.user.userId;
        const userRole = req.user.role;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const post = await postModel.getPostById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        if (post.author_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ error: 'You do not have permission to change the status of this post' });
        }

        await postModel.updatePostStatus(postId, status);
        res.json({ message: `Post status successfully updated to ${status}` });
    } catch (error) {
        res.status(500).json({ error: 'Error updating post status' });
    }
};

const savePost = async (req, res) => {
    try {
        const userId = req.user.userId;
        const postId = req.params.postId;
        await postModel.savePost(userId, postId);
        res.json({ message: 'Post successfully saved' });
    } catch (error) {
        res.status(500).json({ error: 'Error saving post' });
    }
};

const getSavedPosts = async (req, res) => {
    try {
        const userId = req.user.userId;
        const savedPosts = await postModel.getSavedPosts(userId);
        res.json(savedPosts);
    } catch (error) {
        res.status(500).json({ error: 'Error when retrieving saved posts' });
    }
};

const removeSavedPost = async (req, res) => {
    try {
        const userId = req.user.userId;
        const postId = req.params.postId;
        await postModel.removeSavedPost(userId, postId);
        res.json({ message: 'Post successfully removed from saved posts' });
    } catch (error) {
        res.status(500).json({ error: 'Error when deleting a post from saved ones' });
    }
};



module.exports = {
    getAllPosts,
    getPostById,
    getCommentsByPostId,
    createPost,
    updatePost,
    deletePost,
    getCategoriesByPostId,
    createComment,
    getLikesByPostId,
    likePost,
    unlikePost,
    updatePostStatus,
    savePost,
    getSavedPosts,
    removeSavedPost,
};
