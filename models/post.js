const createConnection = require('../db');

const getAllPosts = async ({ sort, category, dateStart, dateEnd, status }) => {
    const db = await createConnection();
    
    const orderBy = sort === 'date' ? 'p.publish_date' : 'p.rating';

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (category) {
        whereClause += ' AND c.title = ?';
        params.push(category);
    }

    if (dateStart && dateEnd) {
        whereClause += ' AND p.publish_date BETWEEN ? AND ?';
        params.push(dateStart, dateEnd);
    }

    if (status) {
        whereClause += ' AND p.status = ?';
        params.push(status);
    }

    const [results] = await db.execute(
        `SELECT p.id, p.title, p.content, p.publish_date, p.status, p.rating, u.login as author,
        GROUP_CONCAT(c.title) as categories
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN post_categories pc ON p.id = pc.post_id
        LEFT JOIN categories c ON pc.category_id = c.id
        ${whereClause}
        GROUP BY p.id
        ORDER BY ${orderBy} DESC`,
        params
    );
    
    await db.end();
    return results;
};

const getPostById = async (postId) => {
    const db = await createConnection();
    const [results] = await db.execute(
        `SELECT p.*, u.login as author, GROUP_CONCAT(c.title) as categories
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN post_categories pc ON p.id = pc.post_id
        LEFT JOIN categories c ON pc.category_id = c.id
        WHERE p.id = ?
        GROUP BY p.id`,
        [postId]
    );
    await db.end();
    return results[0] || null;
};

const createPost = async (postData) => {
    const db = await createConnection();
    const { authorId, title, content, categories } = postData;
    const [result] = await db.execute(
        'INSERT INTO posts (author_id, title, content, status) VALUES (?, ?, ?, "active")',
        [authorId, title, content]
    );

    const postId = result.insertId;

    if (categories && categories.length > 0) {
        const categoryValues = categories.map((categoryId) => [postId, categoryId]);
        await db.query(
            'INSERT INTO post_categories (post_id, category_id) VALUES ?',
            [categoryValues]
        );
    }

    await db.end();
    return result;
};

const updatePost = async (postId, postData) => {
    const db = await createConnection();
    const { title, content, categories } = postData;
    const [result] = await db.execute(
        'UPDATE posts SET title = ?, content = ? WHERE id = ?',
        [title, content, postId]
    );

    await db.execute('DELETE FROM post_categories WHERE post_id = ?', [postId]);
    if (categories && categories.length > 0) {
        const categoryValues = categories.map((categoryId) => [postId, categoryId]);
        await db.query(
            'INSERT INTO post_categories (post_id, category_id) VALUES ?',
            [categoryValues]
        );
    }

    await db.end();
    return result;
};

const deletePost = async (postId) => {
    const db = await createConnection();
    const [result] = await db.execute('DELETE FROM posts WHERE id = ?', [postId]);
    await db.end();
    return result;
};

const getCommentsByPostId = async (postId) => {
    const db = await createConnection();
    const [results] = await db.execute(
        `SELECT c.id, c.content, c.publish_date, u.login as author
        FROM comments c
        JOIN users u ON c.author_id = u.id
        WHERE c.post_id = ?`,
        [postId]
    );
    await db.end();
    return results;
};

const createComment = async (commentData) => {
    const db = await createConnection();
    const { postId, authorId, content } = commentData;
    const [result] = await db.execute(
        'INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)',
        [postId, authorId, content]
    );
    await db.end();
    return result;
};

const getCategoriesByPostId = async (postId) => {
    const db = await createConnection();
    const [results] = await db.execute(
        `SELECT c.id, c.title
        FROM categories c
        JOIN post_categories pc ON c.id = pc.category_id
        WHERE pc.post_id = ?`,
        [postId]
    );
    await db.end();
    return results;
};

const getLikesByPostId = async (postId) => {
    const db = await createConnection();
    const [results] = await db.execute(
        `SELECT l.id, l.type, l.publish_date, u.login as author
        FROM likes l
        JOIN users u ON l.author_id = u.id
        WHERE l.entity_type = 'post' AND l.entity_id = ?`,
        [postId]
    );
    await db.end();
    return results;
};

const addLike = async (likeData) => {
    const db = await createConnection();
    const { postId, userId, type } = likeData;
    const ratingChange = type === 'like' ? 1 : -1;

    const [existingLikes] = await db.execute('SELECT * FROM likes WHERE entity_type = "post" AND entity_id = ? AND author_id = ?', [postId, userId]);
    if (existingLikes.length > 0) throw new Error('You have already left a like or dislike');

    const [postAuthor] = await db.execute('SELECT author_id FROM posts WHERE id = ?', [postId]);
    const authorId = postAuthor[0].author_id;

    await db.execute('INSERT INTO likes (entity_type, entity_id, author_id, type) VALUES ("post", ?, ?, ?)', [postId, userId, type]);
    await db.execute('UPDATE posts SET rating = rating + ? WHERE id = ?', [ratingChange, postId]);
    await db.execute('UPDATE users SET rating = rating + ? WHERE id = ?', [ratingChange, authorId]);

    await db.end();
};

const removeLike = async (likeData) => {
    const db = await createConnection();
    const { postId, userId } = likeData;

    const [likes] = await db.execute('SELECT type FROM likes WHERE entity_type = "post" AND entity_id = ? AND author_id = ?', [postId, userId]);
    if (likes.length === 0) throw new Error('Like or dislike not found');

    const ratingChange = likes[0].type === 'like' ? -1 : 1;

    const [postAuthor] = await db.execute('SELECT author_id FROM posts WHERE id = ?', [postId]);
    const authorId = postAuthor[0].author_id;

    await db.execute('DELETE FROM likes WHERE entity_type = "post" AND entity_id = ? AND author_id = ?', [postId, userId]);
    await db.execute('UPDATE posts SET rating = rating + ? WHERE id = ?', [ratingChange, postId]);
    await db.execute('UPDATE users SET rating = rating + ? WHERE id = ?', [ratingChange, authorId]);

    await db.end();
};

const updatePostStatus = async (postId, status) => {
    const db = await createConnection();
    const [result] = await db.execute(
        'UPDATE posts SET status = ? WHERE id = ?',
        [status, postId]
    );
    await db.end();
    return result;
};

const getUserAccessiblePosts = async (userId, { sort, category, dateStart, dateEnd, status }) => {
    const db = await createConnection();

    const orderBy = sort === 'date' ? 'p.publish_date' : 'p.rating';

    let whereClause = 'WHERE (p.status = "active" OR p.author_id = ?)';
    const params = [userId];

    if (category) {
        whereClause += ' AND c.title = ?';
        params.push(category);
    }

    if (dateStart && dateEnd) {
        whereClause += ' AND p.publish_date BETWEEN ? AND ?';
        params.push(dateStart, dateEnd);
    }

    if (status) {
        whereClause += ' AND p.status = ?';
        params.push(status);
    }

    const [results] = await db.execute(
        `SELECT p.id, p.title, p.content, p.publish_date, p.status, p.rating, u.login as author,
        GROUP_CONCAT(c.title) as categories
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN post_categories pc ON p.id = pc.post_id
        LEFT JOIN categories c ON pc.category_id = c.id
        ${whereClause}
        GROUP BY p.id
        ORDER BY ${orderBy} DESC`,
        params
    );

    await db.end();
    return results;
};

const savePost = async (userId, postId) => {
    const db = await createConnection();
    await db.execute(
        'INSERT IGNORE INTO saved_posts (user_id, post_id) VALUES (?, ?)',
        [userId, postId]
    );
    await db.end();
};

const getSavedPosts = async (userId) => {
    const db = await createConnection();
    const [results] = await db.execute(
        `SELECT p.id, p.title, p.content, p.publish_date, p.status, p.rating
         FROM posts p
         JOIN saved_posts sp ON p.id = sp.post_id
         WHERE sp.user_id = ?`,
        [userId]
    );
    await db.end();
    return results;
};

const removeSavedPost = async (userId, postId) => {
    const db = await createConnection();
    await db.execute(
        'DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?',
        [userId, postId]
    );
    await db.end();
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    getCommentsByPostId,
    createComment,
    getCategoriesByPostId,
    getLikesByPostId,
    addLike,
    removeLike,
    updatePostStatus,
    getUserAccessiblePosts,
    savePost,
    getSavedPosts,
    removeSavedPost,
};
