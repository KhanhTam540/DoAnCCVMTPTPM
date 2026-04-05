var db  = require('../config/db');

let findAllCombos = async () => {
  let [combos] = await db.query(`
    SELECT p.*, c.name as category_name
    FROM parts p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_combo = TRUE
    ORDER BY p.created_at DESC
  `);
  return combos;
};

let findComboById = async (id) => {
  let [comboInfo] = await db.query(`
    SELECT p.*, c.name as category_name
    FROM parts p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? AND p.is_combo = TRUE
  `, [id]);
  return comboInfo;
};

let findComboItemsByComboId = async (id) => {
  let [items] = await db.query(`
    SELECT p.*, ci.quantity as combo_quantity, c.name as category_name
    FROM combo_items ci
    JOIN parts p ON ci.part_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE ci.combo_id = ?
  `, [id]);
  return items;
};

module.exports = {
  findAllCombos,
  findComboById,
  findComboItemsByComboId
};
