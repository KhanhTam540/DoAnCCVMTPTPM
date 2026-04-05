var db  = require('../config/db');

let findAllCategories = async () => {
  let [categories] = await db.query('SELECT * FROM categories ORDER BY name');
  return categories;
};

let createCategory = async (name) => {
  let [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
  return result;
};

let updateCategoryById = async (id, name) => {
  let [result] = await db.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
  return result;
};

let deleteCategoryById = async (id) => {
  let [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
  return result;
};

module.exports = {
  findAllCategories,
  createCategory,
  updateCategoryById,
  deleteCategoryById
};
