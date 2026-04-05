var db  = require('../config/db');

let findByBrandId = async (brandId) => {
  let [models] = await db.query(
    'SELECT * FROM car_models WHERE brand_id = ? ORDER BY name',
    [brandId]
  );

  return models;
};

let findByModelId = async (modelId) => {
  let [years] = await db.query(
    'SELECT * FROM model_years WHERE model_id = ? ORDER BY year DESC',
    [modelId]
  );

  return years;
};

let createModel = async ({ brand_id, name }) => {
  let [result] = await db.query(
    'INSERT INTO car_models (brand_id, name) VALUES (?, ?)',
    [brand_id, name]
  );

  return result;
};

let updateModelById = async (id, { brand_id, name }) => {
  let [result] = await db.query(
    'UPDATE car_models SET brand_id = ?, name = ? WHERE id = ?',
    [brand_id, name, id]
  );

  return result;
};

let deleteModelById = async (id) => {
  let [result] = await db.query('DELETE FROM car_models WHERE id = ?', [id]);
  return result;
};

let createModelYear = async ({ model_id, year }) => {
  let [result] = await db.query(
    'INSERT INTO model_years (model_id, year) VALUES (?, ?)',
    [model_id, year]
  );

  return result;
};

let deleteModelYearById = async (id) => {
  let [result] = await db.query('DELETE FROM model_years WHERE id = ?', [id]);
  return result;
};

module.exports = {
  findByBrandId,
  findByModelId,
  createModel,
  updateModelById,
  deleteModelById,
  createModelYear,
  deleteModelYearById
};
