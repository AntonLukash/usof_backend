const db = require('../db');

const createComment = async (commentData) => {
    const { authorId, postId, content } = commentData;
    const dbConnection = await db();
    const [result] = await dbConnection.execute(
        'INSERT INTO comments (author_id, post_id, content) VALUES (?, ?, ?)',
        [authorId, postId, content]
    );
    await dbConnection.end();
    return result;
};

const getCommentsByPostId = async (postId) => {
    const dbConnection = await db();
    const [results] = await dbConnection.execute(
        `SELECT c.*, u.login as author_login
         FROM comments c
         JOIN users u ON c.author_id = u.id
         WHERE c.post_id = ?`,
        [postId]
    );
    await dbConnection.end();
    return results;
};

const getCommentById = async (commentId) => {
    const dbConnection = await db();
    const [results] = await dbConnection.execute(
        'SELECT * FROM comments WHERE id = ?',
        [commentId]
    );
    await dbConnection.end();
    return results[0];
};

const getCommentLikes = async (commentId) => {
    const dbConnection = await db();
    const [results] = await dbConnection.execute(
        'SELECT * FROM likes WHERE entity_type = "comment" AND entity_id = ?',
        [commentId]
    );
    await dbConnection.end();
    return results;
};

const createCommentLike = async (commentId, authorId, type) => {
    const dbConnection = await db();
    const ratingChange = type === 'like' ? 1 : -1;

    const [existingLikes] = await dbConnection.execute(
        'SELECT * FROM likes WHERE entity_type = "comment" AND entity_id = ? AND author_id = ?',
        [commentId, authorId]
    );
    if (existingLikes.length > 0) {
        await dbConnection.end();
        throw new Error('Вы уже оставили лайк или дизлайк');
    }

    const [commentAuthor] = await dbConnection.execute(
        'SELECT author_id FROM comments WHERE id = ?',
        [commentId]
    );
    const commentAuthorId = commentAuthor[0].author_id;

    await dbConnection.execute(
        'INSERT INTO likes (entity_type, entity_id, author_id, type) VALUES ("comment", ?, ?, ?)',
        [commentId, authorId, type]
    );
    await dbConnection.execute(
        'UPDATE comments SET rating = rating + ? WHERE id = ?',
        [ratingChange, commentId]
    );
    await dbConnection.execute(
        'UPDATE users SET rating = rating + ? WHERE id = ?',
        [ratingChange, commentAuthorId]
    );
    await dbConnection.end();
};

const deleteCommentLike = async (commentId, authorId) => {
    const dbConnection = await db();

    const [likes] = await dbConnection.execute(
        'SELECT type FROM likes WHERE entity_type = "comment" AND entity_id = ? AND author_id = ?',
        [commentId, authorId]
    );
    if (likes.length === 0) {
        await dbConnection.end();
        throw new Error('Like or dislike not found');
    }

    const ratingChange = likes[0].type === 'like' ? -1 : 1;

    const [commentAuthor] = await dbConnection.execute(
        'SELECT author_id FROM comments WHERE id = ?',
        [commentId]
    );
    const commentAuthorId = commentAuthor[0].author_id;

    await dbConnection.execute(
        'DELETE FROM likes WHERE entity_type = "comment" AND entity_id = ? AND author_id = ?',
        [commentId, authorId]
    );
    await dbConnection.execute(
        'UPDATE comments SET rating = rating + ? WHERE id = ?',
        [ratingChange, commentId]
    );
    await dbConnection.execute(
        'UPDATE users SET rating = rating + ? WHERE id = ?',
        [ratingChange, commentAuthorId]
    );
    await dbConnection.end();
};

const updateComment = async (commentId, content) => {
    const dbConnection = await db();
    const [result] = await dbConnection.execute(
        'UPDATE comments SET content = ? WHERE id = ?',
        [content, commentId]
    );
    await dbConnection.end();
    return result;
};

const deleteComment = async (commentId) => {
    const dbConnection = await db();
    const [result] = await dbConnection.execute(
        'DELETE FROM comments WHERE id = ?',
        [commentId]
    );
    await dbConnection.end();
    return result;
};

const checkCommentLikeExists = async (commentId, authorId) => {
    const dbConnection = await db();
    const [results] = await dbConnection.execute(
        'SELECT * FROM likes WHERE entity_type = "comment" AND entity_id = ? AND author_id = ?',
        [commentId, authorId]
    );
    await dbConnection.end();
    return results.length > 0;
};

const createOrUpdateCommentLike = async (commentId, authorId, type) => {
    const dbConnection = await db();
    const [result] = await dbConnection.execute(
        `INSERT INTO likes (entity_type, entity_id, author_id, type) 
         VALUES ("comment", ?, ?, ?) 
         ON DUPLICATE KEY UPDATE type = ?`,
        [commentId, authorId, type, type]
    );
    await dbConnection.end();
    return result;
};

module.exports = {
    createComment,
    getCommentsByPostId,
    getCommentById,
    getCommentLikes,
    createCommentLike,
    updateComment,
    deleteComment,
    deleteCommentLike,
    checkCommentLikeExists,
    createOrUpdateCommentLike,
};
