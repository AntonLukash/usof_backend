const db = require('../db');

const createCategory = async (categoryData) => {
  const { title, description } = categoryData;
  const [result] = await db.execute(
    'INSERT INTO categories (title, description) VALUES (?, ?)',
    [title, description]
  );
  return result;
};

const getAllCategories = async () => {
  const [results] = await db.execute('SELECT * FROM categories');
  return results;
};

const getCategoryById = async (categoryId) => {
  const [results] = await db.execute('SELECT * FROM categories WHERE id = ?', [categoryId]);
  return results[0] || null;
};

const updateCategory = async (categoryId, categoryData) => {
  const { title, description } = categoryData;
  const [result] = await db.execute(
    'UPDATE categories SET title = ?, description = ? WHERE id = ?',
    [title, description, categoryId]
  );
  return result;
};

const deleteCategory = async (categoryId) => {
  const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [categoryId]);
  return result;
};

const getPostsByCategory = async (categoryId) => {
  const [results] = await db.execute(
    `SELECT posts.* 
     FROM posts
     JOIN post_categories ON posts.id = post_categories.post_id
     WHERE post_categories.category_id = ?`,
    [categoryId]
  );
  return results;
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getPostsByCategory,
};
