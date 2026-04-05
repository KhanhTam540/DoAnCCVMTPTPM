var db  = require('../config/db');

let findAll = async () => {
  let [brands] = await db.query('SELECT * FROM brands ORDER BY name');
  return brands;
};

let createBrand = async ({ name, country }) => {
  let [result] = await db.query(
    'INSERT INTO brands (name, country) VALUES (?, ?)',
    [name, country]
  );

  return result;
};

let updateBrandById = async (id, { name, country }) => {
  let [result] = await db.query(
    'UPDATE brands SET name = ?, country = ? WHERE id = ?',
    [name, country, id]
  );

  return result;
};

let deleteBrandById = async (id) => {
  let [result] = await db.query('DELETE FROM brands WHERE id = ?', [id]);
  return result;
};

module.exports = { findAll, createBrand, updateBrandById, deleteBrandById };
